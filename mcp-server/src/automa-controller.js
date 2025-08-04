import puppeteer from 'puppeteer-core';
import * as chromeLauncher from 'chrome-launcher';

export class AutomaController {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async ensureBrowser() {
    if (!this.browser) {
      // 启动 Chrome
      const chrome = await chromeLauncher.launch({
        startingUrl: 'about:blank',
        chromeFlags: [
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-blink-features=AutomationControlled',
        ],
      });
      
      // 连接到 Chrome
      this.browser = await puppeteer.connect({
        browserURL: `http://localhost:${chrome.port}`,
        defaultViewport: null,
      });
      
      // 保存 Chrome 实例以便后续关闭
      this.chrome = chrome;
      
      const pages = await this.browser.pages();
      this.page = pages[0] || await this.browser.newPage();
      
      // 设置一些有用的默认值
      await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    }
    
    return this.page;
  }

  async navigate(url, waitForSelector) {
    const page = await this.ensureBrowser();
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { visible: true });
    }
    
    return {
      success: true,
      url: page.url(),
      title: await page.title(),
    };
  }

  async click(selector, waitForNavigation = false) {
    const page = await this.ensureBrowser();
    
    // 等待元素出现
    await page.waitForSelector(selector, { visible: true });
    
    if (waitForNavigation) {
      // 同时等待点击和导航
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click(selector),
      ]);
    } else {
      await page.click(selector);
    }
    
    return {
      success: true,
      clicked: selector,
      currentUrl: page.url(),
    };
  }

  async type(selector, text, clear = true) {
    const page = await this.ensureBrowser();
    
    // 等待输入框出现
    await page.waitForSelector(selector, { visible: true });
    
    if (clear) {
      // 清空输入框
      await page.click(selector, { clickCount: 3 });
      await page.keyboard.press('Backspace');
    }
    
    // 输入文本
    await page.type(selector, text);
    
    return {
      success: true,
      selector,
      text,
    };
  }

  async waitForElement(selector, timeout = 30000) {
    const page = await this.ensureBrowser();
    
    try {
      await page.waitForSelector(selector, { visible: true, timeout });
      return {
        success: true,
        found: true,
        selector,
      };
    } catch (error) {
      return {
        success: false,
        found: false,
        selector,
        error: '元素未在指定时间内出现',
      };
    }
  }

  async screenshot(fullPage = false, selector) {
    const page = await this.ensureBrowser();
    
    let screenshotOptions = {
      encoding: 'base64',
      fullPage,
    };
    
    let element = null;
    if (selector) {
      element = await page.$(selector);
      if (!element) {
        throw new Error(`找不到元素: ${selector}`);
      }
    }
    
    const screenshot = element 
      ? await element.screenshot(screenshotOptions)
      : await page.screenshot(screenshotOptions);
    
    return {
      success: true,
      screenshot: `data:image/png;base64,${screenshot}`,
      timestamp: new Date().toISOString(),
    };
  }

  async extractText(selector) {
    const page = await this.ensureBrowser();
    
    // 等待元素出现
    await page.waitForSelector(selector, { visible: true });
    
    // 提取文本
    const texts = await page.$$eval(selector, (elements) => {
      return elements.map(el => el.textContent.trim());
    });
    
    return {
      success: true,
      selector,
      texts,
      count: texts.length,
    };
  }

  async runWorkflow(steps) {
    const results = [];
    
    for (const step of steps) {
      try {
        let result;
        
        switch (step.action) {
          case 'navigate':
            result = await this.navigate(step.params.url, step.params.waitForSelector);
            break;
            
          case 'click':
            result = await this.click(step.params.selector, step.params.waitForNavigation);
            break;
            
          case 'type':
            result = await this.type(step.params.selector, step.params.text, step.params.clear);
            break;
            
          case 'wait':
            result = await this.waitForElement(step.params.selector, step.params.timeout);
            break;
            
          case 'screenshot':
            result = await this.screenshot(step.params.fullPage, step.params.selector);
            break;
            
          case 'extract':
            result = await this.extractText(step.params.selector);
            break;
            
          default:
            throw new Error(`未知的操作: ${step.action}`);
        }
        
        results.push({
          step: step.action,
          success: true,
          result,
        });
        
        // 步骤之间添加短暂延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        results.push({
          step: step.action,
          success: false,
          error: error.message,
        });
        
        // 如果出错，停止执行后续步骤
        break;
      }
    }
    
    return {
      success: results.every(r => r.success),
      results,
      totalSteps: steps.length,
      completedSteps: results.filter(r => r.success).length,
    };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
    
    if (this.chrome) {
      await this.chrome.kill();
      this.chrome = null;
    }
    
    return {
      success: true,
      message: '浏览器已关闭',
    };
  }

  async getStatus() {
    return {
      browserOpen: !!this.browser,
      pageUrl: this.page ? await this.page.url() : null,
      pageTitle: this.page ? await this.page.title() : null,
    };
  }
}