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
   折腾好久才试成功。
   3.1 先怀疑需要编译为 standalone 模式, 后证明不需要，只需要在package.json中添加 type="module" 即可。
   3.2 index.js不允许包含console.log 等语句，否则会报错。  需要使用console.error 来输出错误信息。
   3.3 最后看到 node 启动index.js中的路径 **斜线问题**。  
      在inspector界面上， 将 e:\xxx\index.js 修改为 ：  e:/xxx/index.js  ，终于在 inspector 连接成功了。
       这2种路径才是正确的路径：   e:/xxx/index.js   e:\\xxx\\index.js