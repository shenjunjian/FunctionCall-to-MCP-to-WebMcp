## MCP (Model Context Protocol) 特点总结

### 1. 标准化协议
- 定义了AI模型与外部工具/数据源之间的统一通信标准
- 消除了不同API之间的集成差异

### 2. 上下文感知
- 支持动态上下文传递和管理
- 允许模型在对话中保持状态和历史信息

### 3. 工具调用能力
- 标准化函数调用接口
- 支持参数验证和结果返回

### 4. 资源访问
- 可访问本地文件、数据库、API等资源
- 支持多种数据格式（文本、图像、结构化数据）

### 5. 安全性
- 内置权限控制机制
- 支持沙箱环境执行

### 6. 可扩展性
- 模块化架构设计
- 易于添加新的工具和数据源

### 7. 跨平台兼容
- 支持多种编程语言和框架
- 可在不同环境中部署运行

## 相较 Function Calling 的优势
- 服务端与客户端分离： 可以是不同的语言实现，例如Python、JavaScript等。
- 服务端独立部署
- 便于分享

MCP市场：
[MCP Server](https://mcpservers.org/)
[阿里云百炼MCP广场](https://bailian.console.aliyun.com/cn-beijing?tab=mcp#/mcp-market)

mcp server开发部署后，在vscode中， mcp.json 中允许如下配置

https://vscode.js.cn/docs/copilot/reference/mcp-configuration
```json
{
  "servers": [
    weather_stdio:{
      "type": "stdio",
      "command": "node",
      "args": ["path/to/server.js"],
    },
    weather_http:   {
      "type": "http",
      "url": "http://localhost:8080/mcp",
      "headers": {
        "Authorization": "Bearer your-token"
      }
    }
  ]
}
```


核心区别一目了然：在MCP范式下，工具的描述和实现从应用代码库中剥离，转移到了独立的、可插拔的服务器中。应用（Client）变得轻量且通用，它只需懂得MCP这一种“语言”，就能与任何说这种语言的工具（Server）对话。
因此，MCP与Function Calling并非简单的替代关系，而是互补与扩展。Function Calling是模型理解工具调用意图的“大脑接口”，而MCP是工具被标准化封装、被发现和调用的“网络协议”。在实际架构中，MCP Client从Server获取工具列表，再将其转换为模型（如GPT-4）能识别的Function Calling格式传入；模型决定调用后，再由Client将请求转换回MCP协议发送给Server执行。MCP解决的是工具生态的标准化互联问题，而非改变模型本身的调用机制。



