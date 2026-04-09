import { createStreamProxy } from "@opentiny/next";
import {
  connectWebAgent,
  createMcpServerClientPair,
  proxyMcpServer,
} from "./helper.ts";
import { initializeWebMCPPolyfill } from "@mcp-b/webmcp-polyfill";
import type { Client } from "@modelcontextprotocol/sdk/client";

interface RegisterOnWebAgentOption {
  /** 系统名称，会显示在插件系统中。 eg. xx 智能化页面 */
  name: string;
  /** 远程遥控的页面url eg. https://agent.opentiny.design/api/v1/webmcp-trial/mcp */
  url: string;
  /** 远程遥控的会话id,可选 */
  sessionId?: string;
  /** Transport上的错误回调 */
  onError?: (error: Error) => void;
}

let isRegistered = false;
/**
 * 将当前网页注册为智能应用，并代理到一个后端 web-agent 服务。
 * @param option 注册选项
 * @returns
 */
export async function registerOnWebAgent(option: RegisterOnWebAgentOption) {
  if (isRegistered) {
    throw new Error("registerOnWebAgent can only be called once");
  }
  isRegistered = true;

  initializeWebMCPPolyfill();

  const { server, client } = await createMcpServerClientPair();
  proxyMcpServer(server);

  const { sessionId } = await connectWebAgent(
    client,
    option.url,
    option.sessionId,
  );

  return {
    sessionId,
  };
}
