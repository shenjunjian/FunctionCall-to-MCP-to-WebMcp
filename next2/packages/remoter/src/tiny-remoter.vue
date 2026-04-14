<template>
  <TrContainer v-model:show="show" v-model:fullscreen="fullscreen" :title="title">
    <template #title>
      <h3 class="tr-container__title">
        <slot name="title" :title="title">{{ title }}</slot>
      </h3>
    </template>
    <template #operations>
      <slot name="operations">
        <tr-icon-button :icon="IconNewSession" size="28" svgSize="20" @click="nextAgent.$conversation.createConversation()" />
        <div style="position: relative;">
        <tr-icon-button :icon="IconHistory" size="28" svgSize="20" @click="showHistory = !showHistory" />
         <div v-show="showHistory" class="tr-history-demo-container">
          <div><h3 style="margin: 0; padding: 0 12px">历史对话</h3></div>
          <tr-icon-button
            :icon="IconClose"
            size="28"
            svgSize="20"
            @click="showHistory = false"
            style="position: absolute; right: 14px; top: 14px"
          />
        <tr-history
           class="tr-history-demo"
          :data="nextAgent.$conversation.conversations.value"
          :show-rename-controls="isTouchDevice"
          :selected="nextAgent.$conversation.conversations.value[0]?.id"
          @item-click="(item) => nextAgent.$conversation.switchConversation(item)"
          @item-title-change="(newTitle, item) => nextAgent.$conversation.renameConversation(item, newTitle)"
          @item-action="(action, item) => action.id === 'delete' && nextAgent.$conversation.deleteConversation(item)"
        />
        </div>
      </div>
      </slot>
    </template>
    <template #default>
      <slot name="default">默认插槽</slot>
    </template>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </TrContainer>
</template>
<script setup lang="ts">
import { TrContainer, TrIconButton, TrHistory, useTouchDevice } from "@opentiny/tiny-robot";
import { IconNewSession, IconHistory, IconClose } from "@opentiny/tiny-robot-svgs";
import { NextAgent } from "next-agent";
import { ref } from "vue";

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
});
const fullscreen = defineModel("fullscreen", { type: Boolean, default: false });
const show = defineModel("show", { type: Boolean, default: false });

const { isTouchDevice } = useTouchDevice();
const showHistory = ref(false);

const slots = defineSlots<{
  /** 顶部标题插槽 */
  title(props: { title: string }): any;
  /** 顶部操作插槽 */
  operations(props: {}): any;
  /** 默认插槽 ---- 包含欢迎信息 或者 智能体的聊天信息 */
  default(props: {}): any;
  /** 底部插槽 ---- 包含输入和发送按钮等 */
  footer(props: {}): any;
}>();
</script>

<style>
.tr-history-demo-container {
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

  .tr-history-demo {
    overflow-y: auto;
    flex: 1;

    --tr-history-item-selected-bg: var(--tr-history-item-hover-bg);
    --tr-history-item-selected-color: var(--tr-color-primary);
    --tr-history-item-space-y: 4px;
  }
}

</style>