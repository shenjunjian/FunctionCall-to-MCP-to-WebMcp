import { ref } from "vue";
import type { NextMcpServer } from "../servers/servers";
import {
  McpServer,
  type RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";
import { Client } from "@modelcontextprotocol/sdk/client";
import type { Agent } from "../agent";
import type { ToolSet } from "ai";
import { jsonSchemaToZod } from "json-schema-to-zod";
import { z } from "zod";
/** 管理自定义的MCP服务 */
export function useMcpServers(agent: Agent) {
  const mcpServers = ref<NextMcpServer[]>([]);
  const ignoreToolNames = ref<string[]>([]);
  // 最终传递给 ToolLoopAgent 的工具，不要修改引用地址
  const tools: ToolSet = {};

  agent.$lifeCycle.on("chatStart", async () => {
    // 清空工具
    Object.keys(tools).forEach((key) => {
      delete tools[key];
    });
    // 合并初始工具
    if (agent.settings.tools) {
      Object.assign(tools, agent.settings.tools);
    }
    // 合并 mcpServers 中的工具
    for (const server of mcpServers.value) {
      Object.assign(tools, await getToolsFromServer(server));
    }
  });

  async function getToolsFromServer(server: NextMcpServer) {
    if (server.type === "page") {
      // 从window.navigator 获取工具
      const { server, client } = await createPagePair();
      const clientTools =await client.listTools();  // TODO: 返回的是数组 {} mcp官方的， 不是ai-sdk所需要的
      console.log(clientTools, "本window页面的工具");
      return clientTools;
    }

    // 不匹配则返回空对象
    return {};
  }

  return {
    mcpServers,
    ignoreToolNames,
    tools,
    getToolsFromServer,
  };
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


function refreshTools(server: McpServer) {
  

  const client = navigator.modelContextTesting!;

  client.listTools().forEach((tool) => {
    const zodSchema = jsonSchemaToZod(JSON.parse(tool.inputSchema as string),
     { zodVersion: 3 } as any);
    // 使用 new Function 将字符串转换为实际的 Zod 对象
    const zodObject = new Function("z", `return ${zodSchema}`)(z);
    
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: zodObject,
      },
      async (...args) => {
        return client.executeTool(tool.name, ...args);
      },
    );
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
