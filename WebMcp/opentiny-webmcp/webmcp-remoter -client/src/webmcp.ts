import { WebMcpClient } from "@opentiny/next-sdk";

// 3、初始化一个mcpClient去连接远程的受控的标签网页

let webMcpClient: WebMcpClient;
export async function setupWebMcpClient() {
  if (webMcpClient) return webMcpClient;

  webMcpClient = new WebMcpClient();
  await webMcpClient.connect({
    type: "stream",
    // type: "streamableHttp",
    url: "https://agent.opentiny.design/api/v1/webmcp-trial/mcp?sessionId=sk-123456",
  });

  return webMcpClient;
}
