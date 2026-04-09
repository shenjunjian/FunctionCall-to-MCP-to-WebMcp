import { initializeWebMCPPolyfill } from "@mcp-b/webmcp-polyfill";
import { createChannelServer, proxyMcpServer } from "./helper";

interface RegisterOnPageOption {
  /** 系统名称，会显示在插件系统中。 eg. xx 智能化页面 */
  name: string;
  /** iframe连接时，约定的endpoint 名称, 默认 "endpoint" */
  endpoint?: string;
  /** TODO: 待分析需要什么参数 */
  onError?: (error: Error) => void;
}
let isRegistered = false;

/**  将页面注册为智能应用， 同时支持 page 和 iframe 连接 */
export async function registerOnPage(option: RegisterOnPageOption) {
  if (isRegistered) {
    throw new Error("registerOnPage can only be called once");
  }
  isRegistered = true;

  initializeWebMCPPolyfill();

  const { server } = await createChannelServer(option.endpoint || "endpoint");
  proxyMcpServer(server);
}
