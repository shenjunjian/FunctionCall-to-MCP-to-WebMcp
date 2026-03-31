import { WebMcpClient } from "@opentiny/next-sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";

// 3、WebMcpServer受控端网页已经通过sessionId将自己代理给了`Web Agent`的远程服务器，所以此时我们可以通过sessionId来连接到远程进行间接的访问它了。
// 由于 server端是一个标准mcpServer，已通过 web agent暴露出来。
// 所以我们可以用opentiny的webmcpClient来连接到它， 也可以用标准的MCP CLIENT  来连接到它，甚至可以配置 mcpServer 的json 给 vscode, cursor, trae... 等工具调用它。

// 3.1 使用opentiny的webmcpClient
let webMcpClient: WebMcpClient | Client;
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

// 3.2 也可以使用modelcontextprotocol的mcpClient
export async function setupMcpClient() {
  if (webMcpClient) return webMcpClient;

  webMcpClient = new Client({ name: "mcp-client-cli", version: "1.0.0" });

  const transport = new StreamableHTTPClientTransport(
    new URL(
      "https://agent.opentiny.design/api/v1/webmcp-trial/mcp?sessionId=sk-123456",
    ),
  );
  await webMcpClient.connect(transport);

  return webMcpClient;
}
