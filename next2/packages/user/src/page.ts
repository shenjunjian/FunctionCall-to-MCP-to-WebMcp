import { initializeWebMCPPolyfill } from "@mcp-b/webmcp-polyfill";
import { createMcpServerClientPair, proxyMcpServer } from "./helper.ts";

interface RegisterOnPageOption {
  /** TODO: 待分析需要什么参数 */
  onError?: (error: Error) => void;
}

export function registerOnPage(option: RegisterOnPageOption) {
  initializeWebMCPPolyfill();

  const { server, client } = createMcpServerClientPair();
  proxyMcpServer(server);

  return { server, client };
}
