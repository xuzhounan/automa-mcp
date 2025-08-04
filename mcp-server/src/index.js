#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { AutomaController } from './automa-controller.js';

// 创建 MCP 服务器
const server = new Server(
  {
    name: 'automa-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// 创建 Automa 控制器实例
const automaController = new AutomaController();

// 实现列出可用工具的处理器
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'navigate',
        description: '导航到指定网页',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: '要访问的网页 URL',
            },
            waitForSelector: {
              type: 'string',
              description: '等待的元素选择器（可选）',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'click',
        description: '点击页面元素',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: '要点击的元素选择器',
            },
            waitForNavigation: {
              type: 'boolean',
              description: '是否等待页面导航（默认 false）',
              default: false,
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'type',
        description: '在输入框中输入文本',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: '输入框选择器',
            },
            text: {
              type: 'string',
              description: '要输入的文本',
            },
            clear: {
              type: 'boolean',
              description: '输入前是否清空输入框（默认 true）',
              default: true,
            },
          },
          required: ['selector', 'text'],
        },
      },
      {
        name: 'waitForElement',
        description: '等待元素出现',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: '要等待的元素选择器',
            },
            timeout: {
              type: 'number',
              description: '超时时间（毫秒，默认 30000）',
              default: 30000,
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'screenshot',
        description: '截取当前页面截图',
        inputSchema: {
          type: 'object',
          properties: {
            fullPage: {
              type: 'boolean',
              description: '是否截取整个页面（默认 false）',
              default: false,
            },
            selector: {
              type: 'string',
              description: '要截图的元素选择器（可选）',
            },
          },
        },
      },
      {
        name: 'extractText',
        description: '提取页面文本内容',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: '要提取文本的元素选择器',
            },
          },
          required: ['selector'],
        },
      },
      {
        name: 'runWorkflow',
        description: '运行一系列网页操作',
        inputSchema: {
          type: 'object',
          properties: {
            steps: {
              type: 'array',
              description: '操作步骤数组',
              items: {
                type: 'object',
                properties: {
                  action: {
                    type: 'string',
                    enum: ['navigate', 'click', 'type', 'wait', 'screenshot', 'extract'],
                    description: '操作类型',
                  },
                  params: {
                    type: 'object',
                    description: '操作参数',
                  },
                },
                required: ['action', 'params'],
              },
            },
          },
          required: ['steps'],
        },
      },
      {
        name: 'closeBrowser',
        description: '关闭浏览器',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// 实现调用工具的处理器
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    
    switch (name) {
      case 'navigate':
        result = await automaController.navigate(args.url, args.waitForSelector);
        break;
        
      case 'click':
        result = await automaController.click(args.selector, args.waitForNavigation);
        break;
        
      case 'type':
        result = await automaController.type(args.selector, args.text, args.clear);
        break;
        
      case 'waitForElement':
        result = await automaController.waitForElement(args.selector, args.timeout);
        break;
        
      case 'screenshot':
        result = await automaController.screenshot(args.fullPage, args.selector);
        break;
        
      case 'extractText':
        result = await automaController.extractText(args.selector);
        break;
        
      case 'runWorkflow':
        result = await automaController.runWorkflow(args.steps);
        break;
        
      case 'closeBrowser':
        result = await automaController.close();
        break;
        
      default:
        throw new Error(`未知的工具: ${name}`);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `错误: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// 实现列出资源的处理器
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'automa://status',
        name: 'Automa 状态',
        description: '获取当前 Automa 运行状态',
        mimeType: 'application/json',
      },
      {
        uri: 'automa://workflows',
        name: '可用工作流',
        description: '列出可用的预定义工作流',
        mimeType: 'application/json',
      },
    ],
  };
});

// 实现读取资源的处理器
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  switch (uri) {
    case 'automa://status':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(await automaController.getStatus(), null, 2),
          },
        ],
      };
      
    case 'automa://workflows':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              workflows: [
                {
                  name: 'google-search',
                  description: '在 Google 搜索并提取结果',
                  steps: [
                    { action: 'navigate', params: { url: 'https://www.google.com' } },
                    { action: 'type', params: { selector: 'textarea[name="q"]', text: '{{query}}' } },
                    { action: 'click', params: { selector: 'input[type="submit"]' } },
                    { action: 'wait', params: { selector: '#search' } },
                    { action: 'extract', params: { selector: '.g h3' } },
                  ],
                },
                {
                  name: 'screenshot-page',
                  description: '访问页面并截图',
                  steps: [
                    { action: 'navigate', params: { url: '{{url}}' } },
                    { action: 'wait', params: { selector: 'body' } },
                    { action: 'screenshot', params: { fullPage: true } },
                  ],
                },
              ],
            }, null, 2),
          },
        ],
      };
      
    default:
      throw new Error(`未知的资源 URI: ${uri}`);
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Automa MCP 服务器已启动');
}

main().catch((error) => {
  console.error('服务器错误:', error);
  process.exit(1);
});