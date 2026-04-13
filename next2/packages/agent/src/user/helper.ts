import { Client } from "@modelcontextprotocol/sdk/client";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";
import {
  createStreamProxy,
  MessageChannelServerTransport,
} from "@opentiny/next";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import {
  CallToolRequestSchema,
  CallToolResultSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types";

/** webAgentAble时，快速创建一个基于内存连接的MCPServer和MCPClient pair */
export async function createMcpServerClientPair() {
  // createTransportPair();  备用方案，
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();

  const server = new McpServer(
    { name: "web-mcp-server", version: "1.0.0" },
    { capabilities: { tools: { listChanged: true } } }, // 必须允许 listChanged
  );
  await server.connect(serverTransport);

  const client = new Client(
    { name: "web-mcp-client", version: "1.0.0" },
    { capabilities: { roots: { listChanged: true } } },
  );

  await client.connect(clientTransport);

  return { server, client };
}

/** iframeAble 时，页面侧的server */
export async function createChannelServer(endpoint: string) {
  const server = new McpServer(
    { name: "web-mcp-server", version: "1.0.0" },
    { capabilities: { tools: { listChanged: true } } },
  );
  const transport = new MessageChannelServerTransport(endpoint);

  /**
   * 1. listen很重要，缺失则无法连接。
   * 2. 它是异步的，但此处不添加 await 目的是，它会阻塞后面的加载。 如果 iframe 侧不连接，整个前端就阻塞不执行了 */
  transport.listen();
  await server.connect(transport);
  return { server };
}

function _refreshTools(server: McpServer) {
  const client = navigator.modelContextTesting!;

  const registeredTools = client.listTools().map((tool) => {
    return {
      name: tool.name,
      description: tool.description,
      inputSchema: JSON.parse(tool.inputSchema as string) as any,
    };
  });

  // 注册全部工具
  server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: registeredTools,
  }));
  // 工具的调用
  server.server.setRequestHandler(
    CallToolRequestSchema,
    async (request: any) => {
      try {
        // 参考 modelContext注册工具的例子，工具返回可能有：
        // 1. 普通字符串  eg. "hello world"
        // 2. 普通对象  eg. { name: "张三", age: 18 }
        // 3. mcp标准的对象  eg. { content: [{ type: "text", text: "this is result" }] }
        // 但前端modelContext的tools返回值,永远是字符串格式。需要转换为mcp标准的对象.

        const strToolResult = await client.executeTool(
          request.params.name as string,
          JSON.stringify(request.params.arguments as any),
        );
        if (!strToolResult) {
          throw new Error("用户的工具函数返回空字符串");
        }

        let toolResult: any;
        // 1. 判断用户tool是否返回了普通字符串
        try {
          // 符合3. mcp标准的对象
          toolResult = JSON.parse(strToolResult);
          if (!CallToolResultSchema.parse(toolResult)) {
            // 符合2. 普通对象
            toolResult = { content: [{ type: "text", text: strToolResult }] };
          }
        } catch (error) {
          // 符合1. 普通字符串
          toolResult = { content: [{ type: "text", text: strToolResult }] };
        }

        return toolResult;
      } catch (error) {
        console.error("modelContextTesting.executeTool error", error);
        return {
          content: [
            { type: "text", text: error.message || "执行工具失败" },
          ] as any,
          isError: true,
        };
      }
    },
  );
}
/** 将当前页面的 McpServer 工具代理到 modelContextTesting 上
 *  这样当 McpClient 要执行工具时，实际转发给 modelContextTesting 去执行。
 */
export function proxyMcpServer(server: McpServer) {
  _refreshTools(server);

  navigator.modelContextTesting!.registerToolsChangedCallback(() => {
    _refreshTools(server);
    server.sendToolListChanged();
    console.log("发送消息:页面工具变化了");
  });
}

/** 连接远端 webAgent后端，生成 sessionId 用于后续的通讯*/
export async function connectWebAgent(
  client: Client,
  url: string,
  staticSessionId?: string,
) {
  const { transport, sessionId } = await createStreamProxy({
    client,
    url,
    sessionId: staticSessionId,
  });

  return {
    sessionId,
  };
}
