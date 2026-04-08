import { DelayedPromise } from "@ai-sdk/provider-utils";
import { jsonSchema, tool, type ToolSet } from "ai";

/** iframe 侧的port */
let iframePort: MessagePort | null = null;
let listToolPromise: DelayedPromise<ToolSet> | null = null;
let callToolPromise: DelayedPromise<ToolSet> | null = null;

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

  console.log(
    "MessageChannel 已经创建并发送 port2 到主页面， iframe留下了 iframePort",
    iframePort,
  );

  iframePort.onmessage = (event) => {
    // IFRAME-MSG-FLOW-5
    if (event.data.type === "listToolsResult") {
      const tools: ToolSet = {};
      event.data.tools.forEach((currTool) => {
        tools[currTool.name] = tool({
          description: currTool.description,
          inputSchema: jsonSchema(JSON.parse(currTool.inputSchema as string)),
          // params是入参， aiContext 包含了 {toolCallId, messages,abortSignal}
          execute: async (params: any, aiContext: any) => {
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
