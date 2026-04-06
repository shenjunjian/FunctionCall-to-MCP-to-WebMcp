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
import { DelayedPromise } from "@ai-sdk/provider-utils";
import { nextTick } from "vue";

export class Agent {
  // **************** 智能体管理 ****************
  /** 主体智能体 */
  mainAgent: ToolLoopAgent | null = null;
  /** 智能体额外参数设置, 参考 ai-sdk 的 ToolLoopAgent() 的入参：https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent#parameters */
  settings: ToolLoopAgentSettings = {} as any;
  /** 对话取消信号， eg. agent.abortSignal.abort() */
  abortSignal?: AbortSignal;

  /** 调试流， 是否打印流数据 */
  private debugStream: boolean = false;

  // **************** 消息管理 ****************
  /** 对话消息, 包含用户消息和ai回复 */
  messages: ModelMessage[] = [];
  /** 最后一次对话的响应数据 */
  lastChat: StartContent = null;

  constructor() {}

  /** 设置大语言模型
   *  @param model 大语言模型， eg. provider('modelId') 的返回值
   */
  setModel(model: LanguageModelV3) {
    this.mainAgent = new ToolLoopAgent({ ...this.settings, model });
  }
  /** 对话， message 标准的ai-sdk参数： string | Array<TextPart | ImagePart | FilePart> */
  async chatStream(message: UserModelMessage) {
    this.abortSignal = new AbortController().signal;

    this.messages.push({ role: "user", content: message });

    const streamResult = await this.mainAgent!.stream({
      messages: this.messages,
      abortSignal: this.abortSignal,
    });

    const dp = new DelayedPromise<void>();
    const visitor = new StreamVisitor({
      debug: this.debugStream,
      onFinish: () => {
        nextTick(() => {
          // AI 返回 的 stream.response.message 就是ai返回的完整对话消息, 拼接到主消息列表
          this.messages = this.messages.concat(
            (await streamResult.response).messages,
          );
          dp.resolve();
        });
      },
    });

    this.lastChat = await visitor.traverse(streamResult);

    return dp.promise;
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
