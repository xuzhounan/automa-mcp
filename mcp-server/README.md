# Automa MCP Server

这是一个 MCP (Model Context Protocol) 服务器，让你可以通过 Claude Code 控制浏览器自动化操作，无需编写代码。

## 功能特性

- 🌐 **网页导航** - 访问任意网页
- 🖱️ **元素交互** - 点击、输入文本
- ⏳ **智能等待** - 等待元素出现
- 📸 **页面截图** - 捕获页面或元素
- 📝 **内容提取** - 提取页面文本
- 🔄 **工作流支持** - 运行一系列自动化步骤

## 安装

```bash
cd mcp-server
npm install
```

## 使用方法

### 1. 启动 MCP 服务器

```bash
npm start
```

### 2. 在 Claude Code 中配置

在你的 `~/Library/Application Support/Claude/claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "automa": {
      "command": "node",
      "args": ["/path/to/automa-mcp/mcp-server/src/index.js"],
      "env": {}
    }
  }
}
```

### 3. 重启 Claude Code

重启后，你就可以通过自然语言控制浏览器了！

## 可用的 MCP 工具

### navigate
导航到指定网页
```
参数:
- url: 要访问的网页 URL
- waitForSelector: 等待的元素选择器（可选）
```

### click
点击页面元素
```
参数:
- selector: 要点击的元素选择器
- waitForNavigation: 是否等待页面导航（默认 false）
```

### type
在输入框中输入文本
```
参数:
- selector: 输入框选择器
- text: 要输入的文本
- clear: 输入前是否清空输入框（默认 true）
```

### waitForElement
等待元素出现
```
参数:
- selector: 要等待的元素选择器
- timeout: 超时时间（毫秒，默认 30000）
```

### screenshot
截取页面截图
```
参数:
- fullPage: 是否截取整个页面（默认 false）
- selector: 要截图的元素选择器（可选）
```

### extractText
提取页面文本内容
```
参数:
- selector: 要提取文本的元素选择器
```

### runWorkflow
运行一系列网页操作
```
参数:
- steps: 操作步骤数组，每个步骤包含:
  - action: 操作类型（navigate, click, type, wait, screenshot, extract）
  - params: 操作参数
```

### closeBrowser
关闭浏览器

## 使用示例

在 Claude Code 中，你可以这样说：

- "帮我在百度搜索 'Automa 教程'"
- "访问 GitHub 并搜索 automa 项目"
- "打开淘宝，搜索笔记本电脑，并截图搜索结果"
- "提取当前页面所有标题文本"

## 本地测试

运行简单测试：
```bash
npm run test
```

## 注意事项

- 浏览器默认以非无头模式运行，你可以看到所有操作
- 每个操作之间有短暂延迟，确保页面加载完成
- 截图以 base64 格式返回
- 出错时会自动停止后续操作

## 故障排除

1. **找不到元素** - 检查选择器是否正确，元素是否已加载
2. **超时错误** - 增加等待时间或检查网络连接
3. **权限问题** - 确保有权限启动 Chrome/Chromium

享受自动化的乐趣，喝杯咖啡吧！☕