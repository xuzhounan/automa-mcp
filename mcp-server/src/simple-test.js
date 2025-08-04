import { AutomaController } from './automa-controller.js';

async function simpleTest() {
  console.log('开始简单测试 Automa Controller...\n');
  
  const controller = new AutomaController();
  
  try {
    // 测试 1: 导航到百度
    console.log('1. 导航到百度...');
    const navResult = await controller.navigate('https://www.baidu.com', '#kw');
    console.log('   ✓ 成功:', navResult);
    console.log();
    
    // 暂停一下让用户看到效果
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 测试 2: 输入搜索内容
    console.log('2. 输入搜索内容...');
    const typeResult = await controller.type('#kw', 'Automa 浏览器自动化');
    console.log('   ✓ 成功:', typeResult);
    console.log();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试 3: 点击搜索按钮
    console.log('3. 点击搜索按钮...');
    const clickResult = await controller.click('#su', true);
    console.log('   ✓ 成功:', clickResult);
    console.log();
    
    // 测试 4: 等待搜索结果
    console.log('4. 等待搜索结果...');
    const waitResult = await controller.waitForElement('#content_left', 5000);
    console.log('   ✓ 成功:', waitResult);
    console.log();
    
    // 测试 5: 提取搜索结果标题
    console.log('5. 提取搜索结果标题...');
    try {
      const extractResult = await controller.extractText('#content_left h3');
      console.log('   ✓ 找到', extractResult.count, '个结果');
      if (extractResult.count > 0) {
        console.log('   前3个结果:');
        extractResult.texts.slice(0, 3).forEach((text, i) => {
          console.log(`   ${i + 1}. ${text}`);
        });
      }
    } catch (error) {
      console.log('   ⚠️ 无法提取搜索结果，页面结构可能已更改');
    }
    console.log();
    
    // 测试 6: 截图
    console.log('6. 截取页面截图...');
    const screenshotResult = await controller.screenshot();
    console.log('   ✓ 截图成功，数据长度:', screenshotResult.screenshot.length);
    console.log();
    
    // 测试 7: 运行工作流
    console.log('7. 测试运行工作流（访问 GitHub）...');
    const workflowResult = await controller.runWorkflow([
      {
        action: 'navigate',
        params: { url: 'https://github.com' }
      },
      {
        action: 'wait',
        params: { selector: '.Header' }
      },
      {
        action: 'type',
        params: { 
          selector: 'input[type="text"][placeholder*="Search"]',
          text: 'automa browser automation'
        }
      },
      {
        action: 'screenshot',
        params: { fullPage: false }
      }
    ]);
    console.log('   ✓ 工作流完成:', workflowResult.completedSteps, '/', workflowResult.totalSteps, '步');
    console.log();
    
    // 等待几秒让用户看到结果
    console.log('等待 5 秒后关闭浏览器...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 关闭浏览器
    console.log('8. 关闭浏览器...');
    const closeResult = await controller.close();
    console.log('   ✓ 成功:', closeResult);
    
    console.log('\n✅ 所有测试完成！');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    await controller.close();
  }
}

// 运行测试
simpleTest().catch(console.error);