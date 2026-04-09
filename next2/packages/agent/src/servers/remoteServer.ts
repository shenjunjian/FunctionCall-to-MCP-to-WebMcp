import { type ToolSet } from "ai";

import { Client } from "@modelcontextprotocol/sdk/client";
import { getAISDKTools } from "./getAISDKTools.ts";
import type { IframeServer, SSEServer, StreamableHttpServer } from "./servers";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { MessageChannelClientTransport } from "@opentiny/next";

let client: Client | null = null;
/** 构建远程服务的工具集。适用于 StreamableHttpServer，SSEServer 。
 * 包括带 webAgent sessionId 场景。
 */
export async function buildRemoteTools() {
  if (!client) {
    console.error("client 未初始化, 请调用 initRemoteChannel ");
    return {} as ToolSet;
  }
  return getAISDKTools(client);
}

export async function initRemoteClient(
  server: StreamableHttpServer | SSEServer | IframeServer,
) {
  try {
    client = new Client({ name: "web-mcp-client", version: "1.0.0" });
    let transport;
    if (server.type === "streamable-http") {
      transport = new StreamableHTTPClientTransport(new URL(server.url!));
    } else if (server.type === "sse") {
      transport = new SSEClientTransport(new URL(server.url!));
    } else if (server.type === "iframe") {
      transport = new MessageChannelClientTransport(
        server.endpoint || "endpoint",
        window.parent,
      );
    }

    await client.connect(transport!);
  } catch (error) {
    console.error("initRemoteClient error", error);
  }
}

export async function closeRemoteClient() {
  try {
    await client?.close();
  } catch (error) {
    console.error("closeRemoteClient error", error);
  }
  client = null;
}
