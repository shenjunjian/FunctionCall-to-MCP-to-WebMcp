1. 使用MCP的官方typescript sdk来实现MCP的client端,传输模式为 stdio。 MCP client中包含一个模拟的天气查询的工具函数。 并告诉我如何启动MCP client。

使用pnpm 安装的依赖包： @modelcontextprotocol/sdk zod@3

需要参考如下代码
```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Create client instance
mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });

const serverScriptPath = "../../server/py-server-demo/server.py";
// const serverScriptPath = "../../server/js-server-demo/index.py";

async connectToServer(serverScriptPath: string) {
  try {
    const isJs = serverScriptPath.endsWith(".js");
    const isPy = serverScriptPath.endsWith(".py");
    if (!isJs && !isPy) {
      throw new Error("Server script must be a .js or .py file");
    }
    const command = isPy
      ? process.platform === "win32"
        ? "python"
        : "python3"
      : process.execPath;

    this.transport = new StdioClientTransport({
      command,
      args: [serverScriptPath],
    });
    await this.mcp.connect(this.transport);

    const toolsResult = await this.mcp.listTools();
    this.tools = toolsResult.tools.map((tool) => {
      return {
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema,
      };
    });
    console.log(
      "Connected to server with tools:",
      this.tools.map(({ name }) => name)
    );
  } catch (e) {
    console.log("Failed to connect to MCP server: ", e);
    throw e;
  }
}
```

 