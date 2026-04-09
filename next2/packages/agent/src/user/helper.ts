import { Client } from "@modelcontextprotocol/sdk/client";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";
import {
  createStreamProxy,
  MessageChannelServerTransport,
} from "@opentiny/next";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types";

/** 快速创建一个基于内存连接的MCPServer和MCPClient pair */
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
    {
      capabilities: {
        roots: { listChanged: true },
      },
    },
  );

  await client.connect(clientTransport);

  return { server, client };
}

/** 使用 next提供的： MessageChannelServerTransport  构建mcpServer,再反向代理页面的工具 */
export async function createChannelServer(endpoint: string) {
  const server = new McpServer(
    { name: "web-mcp-server", version: "1.0.0" },
    { capabilities: { tools: { listChanged: true } } },
  );
  const transport = new MessageChannelServerTransport(endpoint);

  await transport.listen();
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
      return client.executeTool(
        request.params.name as string,
        JSON.stringify(request.params.arguments as any),
      );
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
