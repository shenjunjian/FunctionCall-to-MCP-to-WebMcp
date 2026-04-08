import { initializeWebMCPPolyfill } from "@mcp-b/webmcp-polyfill";
import {
  McpServer,
  type RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types";
import { MessageChannelServerTransport } from "@opentiny/next";

interface RegisterOnPageOption {
  /** TODO: 待分析需要什么参数 */
  onError?: (error: Error) => void;
}
let isRegistered = false;
export function registerOnPage(option: RegisterOnPageOption) {
  if (isRegistered) {
    throw new Error("registerOnPage can only be called once");
  }
  isRegistered = true;

  initializeWebMCPPolyfill();

  // iframeEventListen();
  createChannelServer();
}

// 方案一： 手写通论，代理页面的工具
// 1. 监听connect 消息，建立通道port
// 2. port监听listTools 消息，返回工具集
// 3. port监听callTool 消息，调用工具
// 4. port监听disconnect 消息，关闭通道
function iframeEventListen() {
  let parentPort: MessagePort | null = null;
  window.addEventListener("message", (event: MessageEvent) => {
    // IFRAME-MSG-FLOW-2
    if (event.data.type === "connect") {
      console.log("主页面接收到 connect消息，收到 paretnPort", event.ports[0]);
      const port = event.ports[0];
      parentPort = port;

      parentPort.onmessage = (event) => {
        // IFRAME-MSG-FLOW-4
        if (event.data.type === "listTools") {
          const tools = navigator.modelContextTesting!.listTools();
          parentPort?.postMessage({ type: "listToolsResult", tools });
        }
        // IFRAME-MSG-FLOW-6
        else if (event.data.type === "callTool") {
          const { toolName, params } = event.data;
          navigator
            .modelContextTesting!.executeTool(toolName, JSON.stringify(params))
            .then((result) => {
              parentPort?.postMessage({ type: "callToolResult", result });
            })
            .catch((error) => {
              console.error("callTool 执行出错:", error);
              parentPort?.postMessage({
                type: "callToolResult",
                error: error.message,
              });
            });
        } else if (event.data.type === "disconnect") {
          parentPort?.close();
          parentPort = null;
        }
      };
    }
  });
}

// 方案二： 使用 next提供的： MessageChannelServerTransport  构建mcpServer,再反向代理页面的工具
async function createChannelServer() {
  const server = new McpServer(
    { name: "web-mcp-server", version: "1.0.0" },
    { capabilities: { tools: { listChanged: true } } },
  );
  const transport = new MessageChannelServerTransport("endpoint");
  await server.connect(transport);

  proxyMcpServer(server);
}

function refreshTools(server: McpServer) {
  const client = navigator.modelContextTesting!;

  const registeredTools = client.listTools().map((tool) => {
    return {
      name: tool.name,
      description: tool.description,
      inputSchema: JSON.parse(tool.inputSchema as string) as any,
    };
  });

  // 注册全部工具
  server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: registeredTools,
  }));
  // 工具的调用
  server.server.setRequestHandler(
    CallToolRequestSchema,
    async (request: any) => {
      return client.executeTool(
        request.params.name as string,
        JSON.stringify(request.params.arguments as any),
      );
    },
  );
}
/** 将当前页面的 McpServer 工具代理到 modelContextTesting 上
 *  这样当 McpClient 要执行工具时，实际转发给 modelContextTesting 去执行。
 */
export function proxyMcpServer(server: McpServer) {
  refreshTools(server);

  const client = navigator.modelContextTesting!;
  client.registerToolsChangedCallback(() => {
    refreshTools(server);
  });
}
