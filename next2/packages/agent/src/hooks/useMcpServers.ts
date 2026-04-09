import { ref } from "vue";
import type { NextMcpServer } from "../servers/servers";
import type { NextAgent } from "../agent";
import type { ToolSet } from "ai";
import { buildPageTools } from "../servers/pageServer";
import {
  buildIFrameTools,
  closeIframeChannel,
  initIframeChannel,
} from "../servers/iframeServer";
/** 管理自定义的MCP服务 */
export function useMcpServers(agent: NextAgent) {
  /** 所有MCP服务， 尽量不要直接操作mcpServers, 而是调用 addMcpServer(server)*/
  const mcpServers = ref<NextMcpServer[]>([]);
  const ignoreToolNames = ref<string[]>([]);
  // 最终传递给 ToolLoopAgent 的工具，不要修改引用地址
  const tools: ToolSet = {};
  /** 生成服务ID */
  let _guid = 0;

  /** 添加MCP服务 */
  async function addMcpServer(server: NextMcpServer) {
    if (
      (server.type === "iframe" &&
        mcpServers.value.find((s) => s.type === "iframe")) ||
      (server.type === "page" &&
        mcpServers.value.find((s) => s.type === "page"))
    ) {
      console.warn(`MCP服务 ${server.type} 已存在， 请重复添加`);
      return;
    }
    server.id = `${server.type}-${_guid++}`;
    mcpServers.value.push(server);

    if (server.type === "iframe") {
      await initIframeChannel(server.endpoint || "endpoint");
    }
  }
  /** 添加MCP服务 */
  async function removeMcpServer(serverOrId: NextMcpServer | string) {
    const server =
      typeof serverOrId === "string"
        ? mcpServers.value.find((s) => s.id === serverOrId)
        : serverOrId;
    if (!server) return;

    mcpServers.value = mcpServers.value.filter((s) => s !== server);

    if (server.type === "iframe") {
      await closeIframeChannel();
    }
  }
  /** 获取MCP服务的工具 */
  async function getToolsFromServer(server: NextMcpServer) {
    if (server.type === "page") {
      return buildPageTools();
    } else if (server.type === "iframe") {
      return await buildIFrameTools();
    }

    // 不匹配则返回空对象
    console.warn(`不支持的MCP服务类型: ${server.type}, 是不是写错了类型?`);
    return {};
  }

  // 每次对话前，重新刷新所有工具
  agent.$lifeCycle.on("chatStart", async () => {
    // 清空工具
    Object.keys(tools).forEach((key) => {
      delete tools[key];
    });
    // 合并初始工具
    Object.assign(tools, agent.settings.tools || {});
    // 合并 mcpServers 中的工具
    for (const server of mcpServers.value) {
      Object.assign(tools, await getToolsFromServer(server));
    }
    // 移除忽略的工具
    ignoreToolNames.value.forEach((name) => {
      delete tools[name];
    });
  });

  return {
    mcpServers,
    ignoreToolNames,
    tools,
    addMcpServer,
    removeMcpServer,
  };
}
