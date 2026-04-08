import { initializeWebMCPPolyfill } from "@mcp-b/webmcp-polyfill";

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

  iframeEventListen();
}

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
