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

 2. 如何启动MCP server

 在 js-client-demo中，配置上当前 Index.js 的路径， 通过 client来启动这个js文件。

 3. 如何通过 @modelcontextprotocol/inspector  来连接 stdio 模式的MCP server。

4. 把index.js 编译为 standalone 模式

使用 esbuild 进行打包编译：

```bash
# 安装依赖
pnpm add -D typescript esbuild

# 创建 index.ts (从 index.js 转换为 TypeScript)

# 创建 build.js 构建脚本

# 运行构建
node build.js
```

编译后的文件为 `index.standalone.js`，这是一个自包含的 bundle，包含了所有依赖。
