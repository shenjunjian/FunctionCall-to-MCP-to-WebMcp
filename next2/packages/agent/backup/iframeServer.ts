import { DelayedPromise, type ToolExecutionOptions } from "@ai-sdk/provider-utils";
import { jsonSchema, tool, type ToolSet } from "ai";

/** iframe 侧的port */
let iframePort: MessagePort | null = null;
let listToolPromise: DelayedPromise<ToolSet> | null = null;
let callToolPromise: DelayedPromise<ToolSet> | null = null;

// ********* 方案一 *********
/** 构建iframe 服务的工具集。Agent 运行在 iframe中，可以与父页面中的工具进行通信。
 * 兼容同源与不同源的iframe 的两种场景
 */
export function buildIFrameTools() {
  if (!iframePort) {
    console.error("iframePort 未初始化, 请调用 addMcpServer 来添加 mcpServer");
    return {} as ToolSet;
  }
  // IFRAME-MSG-FLOW-3
  listToolPromise = new DelayedPromise<ToolSet>(); // 重置 listToolPromise
  iframePort.postMessage({ type: "listTools" });

  return listToolPromise.promise;
}

/** 在Agent侧建立一个通道，可以连接到 window.parent */
export function initIframeChannel() {
  // IFRAME-MSG-FLOW-1
  const channel = new MessageChannel();

  window.parent.postMessage({ type: "connect" }, "*", [channel.port2]);
  iframePort = channel.port1;

  console.log("MessageChannel 已经创建并发送 port2 到主页面， iframe留下了 iframePort", iframePort);

  iframePort.onmessage = (event) => {
    // IFRAME-MSG-FLOW-5
    if (event.data.type === "listToolsResult") {
      const tools: ToolSet = {};
      event.data.tools.forEach((currTool: { name: string; description: string; inputSchema: string }) => {
        tools[currTool.name] = tool({
          description: currTool.description,
          inputSchema: jsonSchema(JSON.parse(currTool.inputSchema as string)),
          // params是入参， aiContext 包含了 {toolCallId, messages,abortSignal}
          execute: async (params: any, aiContext: ToolExecutionOptions) => {
            callToolPromise = new DelayedPromise<any>(); // 重置 callToolPromise
            // 向port 发送执行请求
            iframePort?.postMessage({
              type: "callTool",
              toolName: currTool.name,
              params,
            });
            return callToolPromise.promise;
          },
        });
      });

      listToolPromise?.resolve(tools);
    }
    // IFRAME-MSG-FLOW-7
    else if (event.data.type === "callToolResult") {
      if (event.data.error) {
        callToolPromise?.reject(event.data.error);
      } else {
        callToolPromise?.resolve(event.data.result);
      }
    }
  };
}

/** 关闭通道， 在从mcpServers中，移除一个 iframeServer 时调用 */
export function closeIframeChannel() {
  if (!iframePort) {
    return;
  }
  iframePort.postMessage({ type: "disconnect" });
  setTimeout(() => {
    iframePort?.close();
    iframePort = null;
  }, 0);
}

// ********* 方案一 的用户侧代码  *********

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
