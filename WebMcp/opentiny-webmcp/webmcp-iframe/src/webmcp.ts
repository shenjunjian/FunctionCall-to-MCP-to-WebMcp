import * as nextSdk from "@opentiny/next-sdk";

// createMessageChannelPairTransport
// createMessageChannelClientTransport
// createMessageChannelServerTransport

import {
  createMessageChannelPairTransport,
  createMessageChannelServerTransport,
  createMessageChannelClientTransport,
} from "@opentiny/next-sdk";
import { WebMcpServer, WebMcpClient, z } from "@opentiny/next-sdk";

// 2、跨 Iframe 通信时, 注意： 下面2个setup函数是异步函数了。

let webMcpServer: WebMcpServer;
export async function setupWebMcpServer() {
  if (webMcpServer) return webMcpServer;

  const transport = createMessageChannelServerTransport("endpoint");
  await transport.listen();

  webMcpServer = new WebMcpServer();
  // 注册一些页面级的工具
  webMcpServer.registerTool(
    "get-time",
    {
      title: "获取当前时间",
      description: "获取当前时间",
      inputSchema: z.object({}) as any,
    },
    async () => {
      return { content: [{ type: "text", text: new Date().toLocaleString() }] };
    },
  );

  await webMcpServer.connect(transport);
  return webMcpServer;
}

let webMcpClient: WebMcpClient;
export async function setupWebMcpClient() {
  if (webMcpClient) return webMcpClient;

  const transport = createMessageChannelClientTransport(
    "endpoint",
    window.parent,
  );
  webMcpClient = new WebMcpClient();
  await webMcpClient.connect(transport);

  return webMcpClient;
}
