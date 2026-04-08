import { ref } from "vue";
import type { NextMcpServer } from "../servers/servers";
import type { Agent } from "../agent";
import type { ToolSet } from "ai";
import { jsonSchema, tool } from "ai";
/** 管理自定义的MCP服务 */
export function useMcpServers(agent: Agent) {
  const mcpServers = ref<NextMcpServer[]>([]);
  const ignoreToolNames = ref<string[]>([]);
  // 最终传递给 ToolLoopAgent 的工具，不要修改引用地址
  const tools: ToolSet = {};

  // 每次对话前，重新刷新所有工具
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
      const clientTools = buildPageTools(); // TODO: 返回的是数组 {} mcp官方的， 不是ai-sdk所需要的
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

function buildPageTools() {
  const client = navigator.modelContextTesting!;
  const tools: ToolSet = {};
  client.listTools().forEach((currTool) => {
    tools[currTool.name] = tool({
      description: currTool.description,
      inputSchema: jsonSchema(JSON.parse(currTool.inputSchema as string)),
      // params是入参， aiContext 包含了 {toolCallId, messages,abortSignal}
      execute: async (params, aiContext) => {
        return client.executeTool(currTool.name, JSON.stringify(params)); // webmcp规范， 参数要字符串化。
      },
    });
  });

  return tools;
}
