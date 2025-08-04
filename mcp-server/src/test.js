import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function testMCPServer() {
  console.log('启动 MCP 服务器测试...\n');

  // 启动 MCP 服务器进程
  const serverProcess = spawn('node', ['src/index.js'], {
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  // 创建客户端传输
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['src/index.js'],
  });

  // 创建客户端
  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    // 连接到服务器
    await client.connect(transport);
    console.log('✓ 已连接到 MCP 服务器\n');

    // 测试列出工具
    console.log('=== 测试列出可用工具 ===');
    const toolsResponse = await client.request(
      { method: 'tools/list' },
      ListToolsRequestSchema
    );
    console.log('可用工具数量:', toolsResponse.tools.length);
    toolsResponse.tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });
    console.log();

    // 测试列出资源
    console.log('=== 测试列出可用资源 ===');
    const resourcesResponse = await client.request(
      { method: 'resources/list' },
      ListResourcesRequestSchema
    );
    console.log('可用资源数量:', resourcesResponse.resources.length);
    resourcesResponse.resources.forEach(resource => {
      console.log(`- ${resource.uri}: ${resource.description}`);
    });
    console.log();

    // 测试调用工具 - 导航到网页
    console.log('=== 测试导航到百度 ===');
    const navigateResponse = await client.request(
      {
        method: 'tools/call',
        params: {
          name: 'navigate',
          arguments: {
            url: 'https://www.baidu.com',
            waitForSelector: '#kw',
          },
        },
      },
      CallToolRequestSchema
    );
    console.log('导航结果:', JSON.parse(navigateResponse.content[0].text));
    console.log();

    // 测试工作流
    console.log('=== 测试运行工作流 ===');
    const workflowResponse = await client.request(
      {
        method: 'tools/call',
        params: {
          name: 'runWorkflow',
          arguments: {
            steps: [
              {
                action: 'navigate',
                params: { url: 'https://www.baidu.com' },
              },
              {
                action: 'type',
                params: { selector: '#kw', text: 'MCP 协议' },
              },
              {
                action: 'click',
                params: { selector: '#su' },
              },
              {
                action: 'wait',
                params: { selector: '#content_left' },
              },
              {
                action: 'extract',
                params: { selector: '.c-title' },
              },
            ],
          },
        },
      },
      CallToolRequestSchema
    );
    console.log('工作流结果:', JSON.parse(workflowResponse.content[0].text));
    console.log();

    // 关闭浏览器
    console.log('=== 关闭浏览器 ===');
    await client.request(
      {
        method: 'tools/call',
        params: {
          name: 'closeBrowser',
          arguments: {},
        },
      },
      CallToolRequestSchema
    );
    console.log('✓ 浏览器已关闭\n');

    console.log('测试完成！');
    
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    // 关闭连接
    await client.close();
    serverProcess.kill();
  }
}

// 运行测试
testMCPServer().catch(console.error);