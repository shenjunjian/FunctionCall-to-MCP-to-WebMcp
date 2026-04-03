import { initializeWebMCPPolyfill } from "@mcp-b/webmcp-polyfill";
import { createMcpServerClientPair, proxyMcpServer } from "./helper.ts";

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

  const { server, client } = createMcpServerClientPair();
  proxyMcpServer(server);

  return { server, client };
}
