import { type ToolSet } from "ai";

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

export async function initIframeChannel(endpoint: string) {
  try {
    client = new Client({ name: "web-mcp-client", version: "1.0.0" });
    const transport = new MessageChannelClientTransport(
      endpoint,
      window.parent,
    );
    await client.connect(transport);
  } catch (error) {
    console.error("initIframeChannel error", error);
  }
}

export async function closeIframeChannel() {
  try {
    await client?.close();
  } catch (error) {
    console.error("closeIframeChannel error", error);
  }
  client = null;
}
