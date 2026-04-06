import type { ModelMessage, UserModelMessage } from "ai";
import type { Agent } from "../agent";

/** 在代理中埋点生命周期的钩子
 * 1. 对话开始
 * 2. 对话结束
 */
export function useLifeCycle(agent: Agent) {
  const cbMap = {
    chatStart: [] as any[],
    chatEnd: [] as any[],
  };

  function on(type: "chatStart", cb: (message: ModelMessage) => void): void;
  function on(type: "chatEnd", cb: (messages: UserModelMessage) => void): void;
  function on(type: "chatStart" | "chatEnd", cb: Function) {
    cbMap[type].push(cb);
  }

  function emit(type: "chatStart" | "chatEnd", ...args: any[]) {
    cbMap[type].forEach((cb) => cb(...args));
  }

  return {
    on,
    emit,
  };
}
