import type { UserModelMessage, ResponseMessage } from "ai";
import type { Agent } from "../agent";

/** 在代理中埋点生命周期的钩子
 * 1. 对话开始
 * 2. 对话结束
 */
export function useLifeCycle(agent: Agent) {
  const chatStartCb = [];
  const chatEndCb = [];

  function onChatStart(cb: (message: UserModelMessage) => void) {
    chatStartCb.push(cb);
  }
  function onChatEnd(cb: (messages: ResponseMessage[]) => void) {
    chatEndCb.push(cb);
  }

  return {
    onChatStart,
    onChatEnd,
  };
}
