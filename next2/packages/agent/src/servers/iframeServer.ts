import { DelayedPromise } from "@ai-sdk/provider-utils";
import { jsonSchema, tool, type ToolSet } from "ai";

import { MessageChannelClientTransport } from "@opentiny/next";
import { Client } from "@modelcontextprotocol/sdk/client";
import { getAISDKTools } from "./getAISDKTools.ts";

let client: Client | null = null;
// ********* 方案二 *********
/** 构建iframe 服务的工具集。Agent 运行在 iframe中，可以与父页面中的工具进行通信。
 * 兼容同源与不同源的iframe 的两种场景
 */
export async function buildIFrameTools() {
  if (!client) {
    console.error("client 未初始化, 请调用 initIframeChannel ");
    return {} as ToolSet;
  }
  return getAISDKTools(client);
}

export function initIframeChannel(endpoint: string) {
  client = new Client({ name: "web-mcp-client", version: "1.0.0" });
  client.connect(new MessageChannelClientTransport(endpoint, window.parent));
  return client;
}
