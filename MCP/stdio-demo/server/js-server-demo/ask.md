1. 使用MCP的官方typescript sdk来实现MCP的server端,传输模式为 stdio。 MCP server中包含一个模拟的天气查询的工具函数。 并告诉我如何启动MCP server。

使用pnpm 安装的依赖包： @modelcontextprotocol/sdk zod@3

需要如下导入变量
```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
  name: "weather",
  version: "1.0.0",
});

  const transport = new StdioServerTransport();
  await server.connect(transport);
  // 使用 server.registerTool 来注册工具
```

 