import type { LanguageModelV3 } from "@ai-sdk/provider";
import {
  ToolLoopAgent,
  tool,
  type ModelMessage,
  type ToolLoopAgentSettings,
  type UserModelMessage,
} from "ai";
import type { StartContent } from "./streamVisitor";
import { StreamVisitor } from "./streamVisitor";
import { z } from "zod";

// import { createOpenAI } from "@ai-sdk/openai";
// const openai = createOpenAI({
//   // custom settings, e.g.
//   headers: {
//     "header-name": "header-value",
//   },
// });

// openai("gpt5");

export class Agent {
  // **************** 智能体管理 ****************

  /** 主体智能体， 用于与大语言模型交互 */
  mainAgent: ToolLoopAgent | null = null;
  /** 智能体额外参数设置,  */
  settings: ToolLoopAgentSettings = {} as any;
  /** 对话取消信号， eg. agent.abortSignal.abort() */
  abortSignal?: AbortSignal;
  timeout?: number;

  // **************** 消息管理 ****************
  /** 对话消息, 包含用户消息和ai回复 */
  messages: ModelMessage[] = [];

  lastChat: StartContent = null;

  constructor() {}

  /** 设置大语言模型
   *  @param model 大语言模型， eg. provider('modelId') 的返回值
   */
  setModel(model: LanguageModelV3) {
    this.mainAgent = new ToolLoopAgent({ ...this.settings, model });
  }
  /** 对话 */
  async chatStream(message: UserModelMessage) {
    this.abortSignal = new AbortController().signal;

    this.messages.push({ role: "user", content: message });

    const stream = await this.mainAgent!.stream({
      messages: this.messages,
      abortSignal: this.abortSignal,
      timeout: this.timeout,
    });

    // AI 返回 的 stream.response.message 就是ai返回的完整对话消息。 可以直接压入messages, 适应的时候 可以精简
    // this.messages.push(stream.response.message);

    this.messages.concat((await stream.response).message);
  }

  /** 取消当前对话， reason 可选，默认值为 "用户取消" */
  stopChat(reason: string = "用户取消") {
    this.abortSignal?.abort(reason);
  }

  /** 重复上次对话 */
  async reLastChat() {
    // 查找最后一条用户消息
    let lastUserIndex = this.messages.findLastIndex(
      (msg) => msg.role === "user",
    );
    if (lastUserIndex === -1) return;

    const lastUserMessage = this.messages[lastUserIndex] as UserModelMessage;

    // 截断消息，不保留到最后一条用户消息
    this.messages = this.messages.slice(0, lastUserIndex);

    // 重新调用 chatStream
    await this.chatStream(lastUserMessage);
  }
}
