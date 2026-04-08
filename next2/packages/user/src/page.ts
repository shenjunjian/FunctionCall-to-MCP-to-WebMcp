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

  // 1. 监听connect 消息，建立通道port
  // 2. port监听listTools 消息，返回工具集
  // 3. port监听callTool 消息，调用工具
  // 4. port监听disconnect 消息，关闭通道
  // TODO: 增加异常处理
  let parentPort: MessagePort | null = null;
  window.addEventListener("message", (event: MessageEvent) => {
    // GLOBAL-2
    if (event.data.type === "connect") {
      console.log("主页面接收到 connect消息，收到 paretnPort", event.ports[0]);
      const port = event.ports[0];
      parentPort = port;

      parentPort.onmessage = (event) => {
        // GLOBAL-4
        if (event.data.type === "listTools") {
          const tools = navigator.modelContextTesting!.listTools();
          parentPort?.postMessage({ type: "listToolsResult", tools });
        }
        // GLOBAL-6
        else if (event.data.type === "callTool") {
          const { toolName, params } = event.data;
          const result = navigator.modelContextTesting!.executeTool(
            toolName,
            JSON.stringify(params),
          );
          parentPort?.postMessage({ type: "callToolResult", result });
        } else if (event.data.type === "disconnect") {
          parentPort?.close();
          parentPort = null;
        }
      };
    }
  });
}
