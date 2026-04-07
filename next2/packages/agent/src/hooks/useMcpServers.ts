import { ref } from "vue";
import type { NextMcpServer } from "../servers/servers";
import {
  McpServer,
  type RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";
import { Client } from "@modelcontextprotocol/sdk/client";

/** 管理自定义的MCP服务 */
export function useMcpServers() {
  const mcpServers = ref<NextMcpServer[]>([]);
  const ignoreToolNames = ref<string[]>([]);

  async function getToolsFromServer(server: NextMcpServer) {
    if (server.type === "page") {
      // 从window.navigator 获取工具
      const { server, client } = await createPagePair();
      const clientTools = client.listTools();
      console.log(clientTools, "本window页面的工具");
      return clientTools;
    }

    // 不匹配则返回空数组
    return [];
  }

  return {
    mcpServers,
    ignoreToolNames,
    getToolsFromServer,
  };
}

/** 从MCP服务中获取工具 */
export function getToolsFromServer(server: NextMcpServer) {
  if (server.type === "page") {
    // 从window.navigator 获取工具
    const { server, client } = await createPagePair();
    const clientTools = client.listTools();
    console.log(clientTools, "本window页面的工具");
    return clientTools;
  }
}

/** 快速创建一个基于内存连接的MCPServer和MCPClient pair */
export async function createPagePair() {
  // createTransportPair();  备用方案，
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();

  const server = new McpServer(
    { name: "web-mcp-server", version: "1.0.0" },
    { capabilities: { tools: { listChanged: true } } }, // 必须允许 listChanged
  );
  proxyMcpServer(server);
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
        inputSchema: tool.inputSchema as any,
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

  //   const client = navigator.modelContextTesting!;
  //   client.registerToolsChangedCallback(() => {
  //     refreshTools(server);
  //   });
}
