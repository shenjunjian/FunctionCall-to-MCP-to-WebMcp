<template>
  <TrContainer v-model:show="show" v-model:fullscreen="fullscreen" :title="title" class="tiny-remoter-wrap">
    <template #title>
      <h3 class="tr-container__title">
        <slot name="title" :title="title">{{ title }}</slot>
      </h3>
    </template>
    <template #operations>
      <slot name="operations">
        <tr-icon-button :icon="IconNewSession" size="28" svgSize="20" data-title-down="新建对话"
          @click="nextAgent.$conversation.createConversation()" />
        <div style="position: relative">
          <tr-icon-button :icon="IconHistory" size="28" svgSize="20" @click="showHistory = !showHistory"
            data-title-down="历史对话" />
          <div v-show="showHistory" class="tr-history-custom-container" v-on-click-outside="() => showHistory = false">
            <div>
              <h3 style="margin: 0; padding: 0 12px">历史对话</h3>
            </div>
            <tr-icon-button :icon="IconClose" size="28" svgSize="20" @click="showHistory = false"
              style="position: absolute; right: 14px; top: 14px" />
            <tr-history class="tr-history-custom" :data="nextAgent.$conversation.conversations.value"
              :show-rename-controls="isTouchDevice" :selected="nextAgent.$conversation.conversations.value[0]?.id"
              @item-click="(item) => { nextAgent.$conversation.switchConversation(item); showHistory = false }"
              @item-title-change="(newTitle, item) => nextAgent.$conversation.renameConversation(item, newTitle)"
              @item-action="(action, item) => action.id === 'delete' && nextAgent.$conversation.deleteConversation(item)" />
          </div>
        </div>
      </slot>
    </template>
    <template #default>
      <slot name="default">
        <slot name="welcome">
          <div v-if="nextAgent.uiMessages.value.length === 0">
            <tr-welcome :title="title" description="我是你的私人智能助手" :icon="welcomeIcon">
            </tr-welcome>
          </div>
        </slot>
        <tr-bubble-provider :store="bubbleStore" :content-renderer-matches="contentRendererMatches">
          <tr-bubble-list v-if="nextAgent.uiMessages.value.length > 0" :messages="nextAgent.uiMessages.value"
            :class="{ 'bubble-list--small': size === 'small' }" v-bind="bubbleListConfig">
          </tr-bubble-list>
        </tr-bubble-provider>
      </slot>
    </template>
    <template #footer>
      <slot name="footer">
        <div class="tiny-remoter-chat-input" :class="{ 'max-container': fullscreen }"
          v-dropzone="{ ...dropzoneConfig, onDrop: handleUploadFiles, onDraggingChange: handleDraggingChange }">
          <div class="chat-input-pills">
            <tr-dropdown-menu v-for="pill in pillItems" :key="pill.id" :items="pill.menus"
              @item-click="handlePillItemClick" trigger="click">
              <template #trigger>
                <TrSuggestionPillButton>{{ pill.text }}</TrSuggestionPillButton>
              </template>
            </tr-dropdown-menu>
          </div>
          <tr-sender ref="senderRef" mode="multiple" v-model="inputMessage" :size="size"
            :class="{ 'tr-sender-compact': !fullscreen }" :placeholder="loading ? '正在思考中...' : '请输入您的问题'"
            :loading="loading" showWordLimit :maxLength="20000" :clearable="true" @submit="handleSendMessage"
            @cancel="cancelRequest">
            <template #header v-if="files.length > 0">
              <TrAttachments :actions="[]" @remove="removeFile"
                :items="files.map(f => ({ rawFile: f, url: fileCacheToURL(f), status: 'success' }))">
              </TrAttachments>
            </template>
            <template #footer-right>
              <!-- 上传按钮 -->
              <UploadButton v-if="uploadButtonConfig" v-bind="uploadButtonConfig" @select="handleUploadFiles" />
              <!-- 语音输入按钮. 暂时用“混合输入”， 因为测试“连续输入”有bug   -->
              <VoiceButton v-if="voiceButtonConfig" v-bind="voiceButtonConfig" />
            </template>
          </tr-sender>
        </div>
        <!-- 浮层组件 -->
        <tr-drag-overlay :is-dragging="isDragging" :drag-target="targetElement" v-bind="dragOverlayConfig" />
      </slot>
    </template>
  </TrContainer>
</template>
<script setup lang="ts">
import {
  TrContainer,
  TrIconButton,
  TrHistory,
  useTouchDevice,
  TrSender,
  TrSuggestionPillButton,
  TrDropdownMenu,
  UploadButton,
  VoiceButton,
  TrWelcome,
  TrBubbleList,
  TrBubbleProvider,
  TrAttachments,
  TrDragOverlay,
  vDropzone,
  type StructuredData,
  type VoiceButtonProps,
  type UploadButtonProps,
  type BubbleListProps,
  type BubbleContentRendererMatch,
  BubbleRendererMatchPriority,
  type Attachment,
  type DropzoneBinding,
  type DragOverlayProps,
} from "@opentiny/tiny-robot";
import {
  IconNewSession,
  IconHistory,
  IconClose,
  IconAi,
  IconUser,
} from "@opentiny/tiny-robot-svgs";
import { vOnClickOutside } from "@vueuse/components";
import { NextAgent } from "next-agent";
import { type FilePart, type ImagePart, type UserModelMessage } from "ai";
import { computed, defineCustomElement, h, markRaw, onMounted, onUnmounted, provide, reactive, ref, shallowRef, type PropType, type Ref } from "vue";
import { bubbleStoreKey, pillItems, type PillItem, type PillItemMenu } from "./utils/const";
import WelcomeLogo from "./components/welcome-logo.vue";
import SchemaCard from "./components/schema-card.ce.vue";
import StartContentRenderer from "./components/start-content-renderer.vue";
import UserModelContentRenderer from "./components/user-model-content-renderer.vue";
import { filesToBase64 } from "./utils/fileHelper";

// 尺寸，定位等，参考  https://opentiny.github.io/tiny-robot/latest/components/container.html#css-变量
// 也可以直接绑定 style, 直接透传到 TrContainer 组件上。
const props = defineProps({
  /** 左上角的标题 */
  title: {
    type: String,
    default: "OpenTiny NEXT",
  },
  /** 智能体代理实例 */
  nextAgent: {
    type: Object as () => NextAgent,
    required: true,
  },
  /** 自定义输入框上方快捷操作按钮（与 pill 下拉菜单格式一致）。不传则使用内置默认文案 */
  pillItems: {
    type: Array as PropType<PillItem[]>,
    default: pillItems,
  },
  /** 语音输入按钮配置，设置false则隐藏按钮。 配置参考 https://docs.opentiny.design/tiny-robot/components/sender.html#voicebutton */
  voiceButtonConfig: {
    type: Object as PropType<VoiceButtonProps>,
    default: () => ({}),
  },
  /** 上传按钮配置，设置false则隐藏按钮。 配置参考 https://docs.opentiny.design/tiny-robot/components/sender.html#uploadbutton */
  uploadButtonConfig: {
    type: Object as PropType<UploadButtonProps>,
    default: () => ({}),
  },
  /** 拖放指令配置，设置false则隐藏按钮。 配置参考 https://opentiny.github.io/tiny-robot/latest/components/drag-overlay.html#attributes */
  dropzoneConfig: {
    type: Object as PropType<DropzoneBinding>,
    default: () => ({}),
  },
  /** 拖放区域配置。 配置参考 https://opentiny.github.io/tiny-robot/latest/components/drag-overlay.html#props */
  dragOverlayConfig: {
    type: Object as PropType<DragOverlayProps>,
    default: () => ({ overlayTitle: '将图片拖到此处完成上传' }),
  },
  /** 聊天内容区域 配置，参考 https://docs.opentiny.design/tiny-robot/components/bubble.html#props
   * 可以设置： 分组策略、角色的头像，位置，形状、 内容渲染模式、autoScroll 等
   */
  bubbleListConfig: {
    type: Object as PropType<BubbleListProps>,
    default: () => ({
      autoScroll: true,
      roleConfigs: {
        user: {
          avatar: h(IconUser, { style: { fontSize: "32px" } }),
          placement: "end",
          shape: "corner",
        },
        assistant: {
          avatar: h(IconAi, { style: { fontSize: "32px" } }),
          placement: "start",
          shape: "corner",
        },
      },
    }),
  },
  /** 聊天内容区域 和 输入框的 尺寸， small 时更为紧凑*/
  size: {
    type: String as PropType<"normal" | "small">,
    default: "normal",
  },
});

const slots = defineSlots<{
  /** 顶部标题插槽 */
  title(props: { title: string }): any;
  /** 顶部操作插槽 */
  operations(props: {}): any;
  /** 默认插槽 ---- 包含欢迎信息 或者 智能体的聊天信息 */
  default(props: {}): any;
  /** 底部插槽 ---- 包含输入和发送按钮等 */
  footer(props: {}): any;
  /** 欢迎插槽 */
  welcome(props: {}): any;
}>();
//********************** 变量 ***********************
const fullscreen = defineModel("fullscreen", { type: Boolean, default: false });
const show = defineModel("show", { type: Boolean, default: false });

const { isTouchDevice } = useTouchDevice();
const showHistory = ref(false);
const inputMessage = ref("");



const loading = computed(() => props.nextAgent.status.value === "processing" || props.nextAgent.status.value === "streaming")
// *********************** 选择文件 & 拖放区域 ***********************
let files: Ref<File[]> = shallowRef([])
let fileUrls: string[] = []
const fileCacheToURL = (file: File) => {
  const url = URL.createObjectURL(file);
  fileUrls.push(url);
  return url;
}
const isDragging = ref(false)
const targetElement = ref<HTMLElement | null>(null)
// *********************** end ***********************

const welcomeIcon = h(WelcomeLogo, { style: { width: "48px", height: "48px" } });

const bubbleStore = reactive({
  mdConfig: { html: true },
  dompurifyConfig: { ADD_TAGS: ["schema-card"], ADD_ATTR: ["schema"] },
  toolCallResults: {},
  reChat: () => props.nextAgent.reLastChat() // 重新对话
});
provide(bubbleStoreKey, bubbleStore);

// 配置 Content 渲染器匹配规则
const contentRendererMatches: BubbleContentRendererMatch[] = [
  {
    find: (message) => message.role === "assistant",
    renderer: markRaw(StartContentRenderer) as any,
    priority: BubbleRendererMatchPriority.NORMAL,
  },
  {
    find: (message) => message.role === "user",
    renderer: markRaw(UserModelContentRenderer) as any,
    priority: BubbleRendererMatchPriority.NORMAL,
  },
]
// ****************** 方法 ***********************
const handlePillItemClick = (menu: PillItemMenu) => {
  inputMessage.value = menu.inputMessage;
};
const handleSendMessage = async (
  textContent: string,
  structuredData?: StructuredData | undefined,
) => {
  let message: UserModelMessage
  // 1个文件，则判断图片后决定用 ImagePart。   【备注】 ai-sdk支持url, buffer, base64 格式. 但参考 qwen 文档，只支持 url, base64 格式. 所以此处取 base64 格式.
  if (files.value.length === 1 && files.value[0].type.startsWith("image/")) {
    message = {
      role: "user", content: [
        { type: "text", text: textContent },
        { type: "image", image: await filesToBase64(files.value[0]), mediaType: files.value[0].type } as ImagePart
      ]
    }
  }
  else {
    // 多个文件，直接用 FilePart。
    if (files.value.length > 0) {
      const fileBase64 = await Promise.all(files.value.map((file) => filesToBase64(file)));
      message = {
        role: "user", content: [
          { type: "text", text: textContent },
          ...fileBase64.map((base64, index) => ({ type: "file", data: base64, size: files.value[index].size, filename: files.value[index].name, mediaType: files.value[index].type } as FilePart))
        ]
      }
    } else {
      // 没有文件，直接用 TextPart。
      message = { role: "user", content: textContent }
    }
  }

  props.nextAgent.chatStream(message);
  inputMessage.value = "";
  files.value = [];
};
const cancelRequest = () => {
  props.nextAgent.cancelChat();
};
// 处理上传文件事件， 与拖放指令释放事件
const handleUploadFiles = (_files: File[]) => {
  files.value = [...files.value, ..._files];
};
// 处理删除文件事件
const removeFile = (file: Attachment) => {
  files.value = files.value.filter(f => f !== file.rawFile);
}
// 处理拖放指令事件
function handleDraggingChange(dragging: boolean, element: HTMLElement | null) {
  isDragging.value = dragging
  targetElement.value = element
  console.log("handleDraggingChange", dragging, element);
}
// ********************* 生命周期 ***********************
onMounted(() => {
  // 注册自定义元素
  if (!customElements.get("schema-card")) {
    const CardElement = defineCustomElement(SchemaCard);
    customElements.define("schema-card", CardElement);
  }
});

onUnmounted(() => {
  files.value = [];
  fileUrls.forEach(url => URL.revokeObjectURL(url));
  fileUrls = [];
});
</script>

<style>
.tiny-remoter-wrap {
  --tr-drag-overlay-content-padding: 0;
}

/** 历史对话弹窗 */
.tr-history-custom-container {
  position: absolute;
  right: 100%;
  top: 100%;
  z-index: var(--tr-z-index-popover);
  width: 300px;
  height: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  background-color: var(--tr-container-bg-default);
  padding: 16px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tr-history-custom-container .tr-history-custom {
  overflow-y: auto;
  flex: 1;

  --tr-history-item-selected-bg: var(--tr-history-item-hover-bg);
  --tr-history-item-selected-color: var(--tr-color-primary);
  --tr-history-item-space-y: 4px;
}

.bubble-list--small {
  --tr-bubble-list-gap: 8px;
  --tr-bubble-text-line-height: 1.2;
}

/** 输入框 及 pill 样式*/
.tiny-remoter-chat-input {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tiny-remoter-chat-input .chat-input-pills {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tiny-remoter-chat-input .pills {
  flex: 1;

  :deep(.tr-suggestion-pills__container) {
    mask: linear-gradient(to right, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%);
  }
}
</style>
