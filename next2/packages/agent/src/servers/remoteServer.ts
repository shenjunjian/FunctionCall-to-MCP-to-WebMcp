import { Client } from "@modelcontextprotocol/sdk/client";
import { getAISDKTools } from "./getAISDKTools.ts";
import type { IframeServer, SSEServer, StreamableHttpServer } from "./servers";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { MessageChannelClientTransport } from "@opentiny/next";

export async function buildRemoteTools(
  server: StreamableHttpServer | SSEServer | IframeServer,
) {
  try {
    const client = new Client({ name: "web-mcp-client", version: "1.0.0" });
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

    const aiSdkTools = await getAISDKTools(client);
    server.tools = aiSdkTools;
    client.close();

    return aiSdkTools;
  } catch (error) {
    console.error("buildRemoteTools error", error);
  }
}
