import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";

class McpClient {
  private mcp: Client;
  private transport: StdioClientTransport | null = null;
  private tools: Array<{
    name: string;
    description: string;
    input_schema: any;
  }> = [];

  constructor() {
    this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
  }

  async connectToServer(serverScriptPath: string) {
    try {
      const isJs = serverScriptPath.endsWith(".js");
      const isPy = serverScriptPath.endsWith(".py");
      if (!isJs && !isPy) {
        throw new Error("Server script must be a .js or .py file");
      }
      const command = isPy ? "python" : process.execPath;

      this.transport = new StdioClientTransport({
        command,
        args: [serverScriptPath],
      });
      await this.mcp.connect(this.transport);

      const toolsResult = await this.mcp.listTools();
      this.tools = toolsResult.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description || "",
          input_schema: tool.inputSchema,
        };
      });
      console.log(
        "Connected to server with tools:",
        this.tools.map(({ name }) => name),
      );
    } catch (e) {
      console.log("Failed to connect to MCP server: ", e);
      throw e;
    }
  }

  // 模拟的天气查询工具函数
  async getWeather(city: string): Promise<string> {
    try {
      const result:any = await this.mcp.callTool({
        name: "get_weather",
        arguments: {
          city,
        },
      });
      return result.content[0].text as string;
    } catch (e) {
      console.log("Failed to get weather: ", e);
      throw e;
    }
  }

  async disconnect() {
    if (this.transport) {
      // MCP client doesn't have a disconnect method, just set transport to null
      this.transport = null;
    }
  }
}

// 示例用法
async function main() {
  const client = new McpClient();

  // 连接到服务器
  // const serverScriptPath = "../../server/py-server-demo/server.py";
  const serverScriptPath = "../../server/js-server-demo/index.js";
  await client.connectToServer(serverScriptPath);

  // 测试天气查询
  try {
    const weather = await client.getWeather("北京");
    console.log("Weather result:", weather);
  } catch (e) {
    console.error("Error getting weather:", e);
  }

  // 断开连接
  await client.disconnect();
}
main().catch(console.error);
