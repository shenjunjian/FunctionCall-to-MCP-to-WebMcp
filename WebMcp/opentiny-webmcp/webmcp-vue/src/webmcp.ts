import * as next from "@opentiny/next";
import * as nextSdk from "@opentiny/next-sdk";

console.log(next);
console.log(nextSdk);
// createMessageChannelPairTransport
// createMessageChannelClientTransport
// createMessageChannelServerTransport

import {
  createMessageChannelPairTransport,
  createMessageChannelServerTransport,
  createMessageChannelClientTransport,
} from "@opentiny/next-sdk";
import { WebMcpServer, WebMcpClient, z } from "@opentiny/next-sdk";

// 1、同一个页面中，创建2个单例对象，分别是webMcpServer和webMcpClient, 共享同一个 PairTransport
const [serverTransport, clientTransport] = createMessageChannelPairTransport();

let webMcpServer: WebMcpServer;
export function setupWebMcpServer() {
  if (webMcpServer) return webMcpServer;

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

  webMcpServer.connect(serverTransport);
  return webMcpServer;
}

let webMcpClient: WebMcpClient;
export function setupWebMcpClient() {
  if (webMcpClient) return webMcpClient;

  webMcpClient = new WebMcpClient();
  webMcpClient.connect(clientTransport);

  return webMcpClient;
}
