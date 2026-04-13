import { initializeWebMCPPolyfill } from "@mcp-b/webmcp-polyfill";
import { createChannelServer, createMcpServerClientPair, connectWebAgent, proxyMcpServer } from "./helper";

export interface RegisterOnPageOption {
  /** 系统名称，会显示在插件系统中。 eg. xx 智能化页面 */
  name: string;
  /** 是否支持 iframe 连接，默认支持 iframe 连接 */
  iframeAble?: boolean;
  /** iframe连接时，约定的endpoint 名称, 默认 "endpoint" */
  endpoint?: string;
  /** 是否支持 web-agent 连接，默认支持 web-agent 连接 */
  webAgentAble?: boolean;
  /** webAgent的服务端url。
   * eg. 在线试用url: https://agent.opentiny.design/api/v1/webmcp-trial/mcp
   *  或本地启动url： http://localhost:3000/api/v1/webmcp/mcp
   * */
  url?: string;
  /** 远程遥控的会话id,可选。 填写后，将固定sessionId */
  sessionId?: string;
}
let isRegistered = false;

/**  将页面注册为智能应用。 注册后，默认支持page 访问， 通过属性选择性支持通过 iframe 连接和 web-agent 连接 */
export async function registerOnPage(option: RegisterOnPageOption) {
  if (isRegistered) {
    throw new Error("registerOnPage can only be called once");
  }
  isRegistered = true;

  initializeWebMCPPolyfill();

  if (option.iframeAble) {
    // 内部有个异步listen会阻塞，所以修改为then的写法，保证主流程是同步的
    createChannelServer(option.endpoint || "endpoint").then(({ server }) => proxyMcpServer(server));
  }

  if (option.webAgentAble) {
    if (!option.url) {
      throw new Error("webAgentAble is true, but url is not provided");
    }

    const { server, client } = await createMcpServerClientPair();
    proxyMcpServer(server);

    const { sessionId } = await connectWebAgent(client, option.url, option.sessionId);

    option.sessionId = sessionId;
  }

  // 回复页面注册信息
  window.addEventListener("message", (event) => {
    if (event.data.type === "getRegisterOnPageOption") {
      event.source?.postMessage(option);
    }
  });
}
