import { registerOnPage } from "./page.ts";
import { createStreamProxy } from "@opentiny/next";
import { createMcpServerClientPair, proxyMcpServer } from "./helper.ts";

interface RegisterOnWebAgentOption {
  /** 远程遥控的页面url eg. https://agent.opentiny.design/api/v1/webmcp-trial/mcp */
  url: string;
  /** 远程遥控的会话id,可选 */
  sessionId?: string;
  /** Transport上的错误回调 */
  onError?: (error: Error) => void;
}
/**
 * 将当前网页注册为智能应用，并代理到一个后端 web-agent 服务
 * @param option 注册选项
 * @returns
 */
export async function registerOnWebAgent(option: RegisterOnWebAgentOption) {
  registerOnPage({});

  const { server, client } = createMcpServerClientPair();
  const { transport, sessionId } = await createStreamProxy({
    client,
    url: option.url,
    sessionId: option.sessionId,
  });

  transport.onerror = async (error: Error) => {
    option.onError?.(error);
  };

  proxyMcpServer(server);

  return {
    server,
    client,
    sessionId,
  };
}
