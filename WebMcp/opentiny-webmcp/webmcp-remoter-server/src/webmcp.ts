import { createMessageChannelPairTransport } from "@opentiny/next-sdk";
import { WebMcpServer, WebMcpClient, z } from "@opentiny/next-sdk";

const [serverTransport, clientTransport] = createMessageChannelPairTransport();

// 3、跨 标签甚至远程浏览器 通信时,
let webMcpServer: WebMcpServer;
export async function setupWebMcpServer() {
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

  await webMcpServer.connect(serverTransport);
  return webMcpServer;
}

let webMcpClient: WebMcpClient;
export async function setupWebMcpClient() {
  if (webMcpClient) return webMcpClient;

  webMcpClient = new WebMcpClient();
  await webMcpClient.connect(clientTransport);

  // 添加远端支持
  await webMcpClient.connect({
    agent: true,
    url: "https://agent.opentiny.design/api/v1/webmcp-trial/mcp",
    sessionId: "sk-123456",
  });

  return webMcpClient;
}

// export interface ClientConnectOptions {
//   url: string
//   token?: string
//   sessionId?: string
//   type?: 'channel' | 'sse' | 'stream' | 'socket'
//   agent?: boolean
//   onError?: (error: Error) => void
// }
