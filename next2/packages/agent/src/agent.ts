import {
  ToolLoopAgent,
  type ModelMessage,
  type ToolLoopAgentSettings,
  type UserModelMessage,
} from "ai";
import type { StartContent } from "./streamVisitor";
import { StreamVisitor } from "./streamVisitor";
import { DelayedPromise } from "@ai-sdk/provider-utils";
import { type Ref } from "vue";
import { useLifeCycle } from "./hooks/useLifeCycle";
import { useConversation } from "./hooks/useConversation";
import { usePromptManager } from "./hooks/usePromptManager";

/** 用户界面渲染的消息体 */
export type UIMessage =
  | UserModelMessage
  | {
      role: "assistant";
      content: Ref<StartContent | undefined>;
    };
export class Agent {
  /** 调试流， 是否打印流数据 */
  private debugStream: boolean = false;

  // **************** 智能体管理 ****************
  /** 主体智能体 */
  private mainAgent: ToolLoopAgent | null = null;
  /** 智能体参数设置 */
  private settings: ToolLoopAgentSettings = {} as any;
  /** 对话取消信号， eg. agent.abortSignal.abort() */
  private abortController?: AbortController;

  // **************** 消息管理 ****************
  /** 对话消息, 包含用户消息和ai回复。在ai 对话结束才一次性插入 */
  messages: ModelMessage[] = [];
  /** 用户界面渲染的消息体。 其中ai 的消息为 ref 的响应式数据， 根据流事件，进行实时更新 */
  uiMessages: UIMessage[] = [];

  // **************** 钩子管理/ 状态管理 ($打头是状态管理变量)  ****************
  $lifeCycle = useLifeCycle(this);
  $conversation = useConversation(this);
  $promptManager = usePromptManager(this);

  /** 初始化智能体， 设置大语言模型
   *  @param settings 智能体参数设置, 参考 ai-sdk 的 ToolLoopAgent() 的入参：https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent#parameters
   *
   *  其中，model:  设置大语言模型，必值项。  eg. xxProvider('modelId') 的返回值
   *
   *  如果后期需要修改智能体参数，可以调用 agent.setAgent(newSettings)!
   */
  constructor(settings: ToolLoopAgentSettings) {
    this.setAgent(settings);
  }

  /** 设置ToolLoopAgent */
  setAgent(settings: ToolLoopAgentSettings) {
    this.settings = settings;
    this.mainAgent = new ToolLoopAgent(settings);
  }
  /** 发起对话， 参数 message 为标准的ai-sdk参数： string | Array<TextPart | ImagePart | FilePart> */
  async chatStream(message: UserModelMessage) {
    this.abortController = new AbortController();

    this.messages.push(message);
    this.uiMessages.push(message);
    this.$lifeCycle.emit("chatStart", message);

    const streamResult = await this.mainAgent!.stream({
      messages: this.messages,
      abortSignal: this.abortController.signal,
    });

    const dp = new DelayedPromise<void>();
    const visitor = new StreamVisitor({
      debug: this.debugStream,
      onFinish: async () => {
        // stream.response.message 就是ai-sdk 包装的ai 多轮对话消息, 拼接到**主消息列表**
        const aiMessages = (await streamResult.response).messages;
        this.messages = this.messages.concat(aiMessages);

        this.$lifeCycle.emit("chatEnd", aiMessages);
        dp.resolve();
      },
    });
    // 立即返回的一个ref数据，拼接到 **UI消息列表**
    const aiContent = visitor.traverse(streamResult);
    this.uiMessages.push({
      role: "assistant",
      content: aiContent,
    });

    return dp.promise;
  }

  /** 取消当前对话， reason 可选，默认值为 "用户取消" */
  cancelChat(reason: string = "用户取消") {
    this.abortController?.abort(reason);
  }

  /** 重复上次对话 */
  async reLastChat() {
    // 截断UI 消息
    let lastUserIndex = this.uiMessages.findLastIndex(
      (msg) => msg.role === "user",
    );
    if (lastUserIndex === -1) return;
    this.uiMessages = this.uiMessages.slice(0, lastUserIndex);

    // 截断对话消息，并获取最后一条用户消息
    lastUserIndex = this.messages.findLastIndex((msg) => msg.role === "user");
    if (lastUserIndex === -1) return;

    const lastUserMessage = this.messages[lastUserIndex] as UserModelMessage;
    this.messages = this.messages.slice(0, lastUserIndex);

    this.$lifeCycle.emit("reChat");

    // 重新调用 chatStream
    await this.chatStream(lastUserMessage);
  }
}
