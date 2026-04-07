import type { Agent } from "../agent";

/** 在代理中埋点生命周期的钩子
 * 1. 对话开始
 * 2. 对话结束
 */
export function useLifeCycle(agent: Agent) {
  const cbMap = {
    chatStart: [] as Function[], // 压入usr消息后触发
    chatEnd: [] as Function[], // 压入ai消息后触发
    reChat: [] as Function[], // 重新发起对话, 清除上次对话记录后触发
  };

  function on(type: keyof typeof cbMap, cb: Function) {
    cbMap[type].push(cb);
  }

  async function emit(type: keyof typeof cbMap, ...args: any[]) {
    for (const cb of cbMap[type]) {
      await cb(...args);
    }
  }

  return {
    on,
    emit,
  };
}
