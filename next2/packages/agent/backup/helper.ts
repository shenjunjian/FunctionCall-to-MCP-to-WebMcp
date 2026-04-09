import { Client } from "@modelcontextprotocol/sdk/client";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";
import { createTransportPair } from "@opentiny/next";
import {
  McpServer,
  type RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp";

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

const registeredTools: RegisteredTool[] = [];

function refreshTools(server: McpServer) {
  // 先取消注册所有工具
  registeredTools.forEach((tool) => {
    tool.remove();
  });

  const client = navigator.modelContextTesting!;

  client.listTools().forEach((tool) => {
    const registeredTool = server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema as any, // TODO: 待分析需要什么参数
      },
      async (...args) => {
        return client.executeTool(tool.name, ...args);
      },
    );
    // 收藏起来，方便后续取消注册
    registeredTools.push(registeredTool);
  });
}
/** 将当前页面的 McpServer 工具代理到 modelContextTesting 上
 *  这样当 McpClient 要执行工具时，实际转发给 modelContextTesting 去执行。
 */
export function proxyMcpServer(server: McpServer) {
  refreshTools(server);

  const client = navigator.modelContextTesting!;
  client.registerToolsChangedCallback(() => {
    refreshTools(server);
  });
}
