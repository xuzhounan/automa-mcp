#!/bin/bash

echo "🚀 Automa MCP Server 安装向导"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm install

echo ""
echo "✅ 依赖安装完成！"
echo ""

# 获取当前路径
CURRENT_PATH=$(pwd)
MCP_SERVER_PATH="$CURRENT_PATH/src/index.js"

echo "📝 Claude Desktop 配置"
echo "====================="
echo ""
echo "请将以下配置添加到你的 Claude Desktop 配置文件中："
echo "配置文件位置: ~/Library/Application Support/Claude/claude_desktop_config.json"
echo ""
echo "{"
echo "  \"mcpServers\": {"
echo "    \"automa\": {"
echo "      \"command\": \"node\","
echo "      \"args\": [\"$MCP_SERVER_PATH\"],"
echo "      \"env\": {}"
echo "    }"
echo "  }"
echo "}"
echo ""

# 询问是否运行测试
echo "🧪 是否运行测试？(y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "运行测试..."
    npm test
fi

echo ""
echo "✅ 安装完成！"
echo ""
echo "下一步："
echo "1. 将上面的配置添加到 Claude Desktop 配置文件"
echo "2. 重启 Claude Desktop"
echo "3. 在 Claude 中说：'帮我在百度搜索天气'"
echo ""
echo "享受自动化的乐趣吧！☕"