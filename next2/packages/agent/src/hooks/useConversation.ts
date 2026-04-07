import type { ModelMessage, UserModelMessage } from "ai";
import type { Agent, UIMessage } from "../agent";
import { ref, type Ref } from "vue";

export type Conversation = {
  id: string;
  title: string;
  messages: ModelMessage[];
  uiMessages: UIMessage[];
  updateTime: string;
  isNew: boolean;
};

const $KEY = "next-conversation-private-key";
/* 对话管理, 创建新会话，删除会话，记录到本地存储
  1. 加载时，创建一个新会话，压入到队列头， 但不记录到本地存储。
  2. 保存时，才检查新会话有没有消息，有消息才生成title。  无消息，证明会话一直未聊天，要移除掉它。
  */
export function useConversation(agent: Agent) {
  /** 最大会话数 */
  const maxConversations = 20;

  // 加载历史会话 + 创建新会话
  const conversations: Ref<Conversation[]> = ref(
    JSON.parse(localStorage.getItem($KEY) || "[]"),
  );
  createConversation();

  /** 插入到队首，更新当前会话 */
  function createConversation() {
    const conversation = _create();
    conversations.value.unshift(conversation);
    return conversation;
  }
  /** 交换到队首，更新当前会话 */
  function switchConversation(conversation: Conversation) {
    deleteConversation(conversation);
    conversations.value.unshift(conversation);
    _save(conversations, maxConversations);
  }
  /** 删除会话 */
  function deleteConversation(conversation: Conversation) {
    conversations.value = conversations.value.filter(
      (c) => c.id !== conversation.id,
    );
    _save(conversations, maxConversations);
  }

  // 注册钩子函数
  function syncMsgAndSave() {
    const current = conversations.value[0];
    current.messages = agent.messages;
    current.uiMessages = agent.uiMessages;
    _save(conversations, maxConversations);
  }

  agent.$lifeCycle.on("chatStart", syncMsgAndSave);
  agent.$lifeCycle.on("chatEnd", syncMsgAndSave);

  return {
    maxConversations,
    conversations,
    createConversation,
    switchConversation,
    deleteConversation,
  };
}

// ************ 内部函数/纯函数 ************
function _create() {
  return {
    id: Date.now().toString(),
    title: "新会话",
    messages: [] as UserModelMessage[],
    uiMessages: [] as UIMessage[],
    updateTime: new Date().toLocaleString(),
    isNew: true,
  };
}

function _save(conversations: Ref<Conversation[]>, maxConversations: number) {
  const current = conversations.value[0];
  const userMessage = current.messages.find((m) => m.role === "user");
  if (!current || !userMessage) return;

  if (current.isNew) {
    const title = userMessage.content?.text || userMessage.content || "";
    current.title = title.slice(0, 10);
    current.isNew = false;
  }
  current.updateTime = new Date().toLocaleString();
  // 保持最多maxConversations个会话
  if (conversations.value.length > maxConversations) {
    conversations.value = conversations.value.slice(0, maxConversations);
  }
  localStorage.setItem($KEY, JSON.stringify(conversations.value));
}
