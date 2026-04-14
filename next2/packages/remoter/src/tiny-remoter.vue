<template>
  <TrContainer v-model:show="show" v-model:fullscreen="fullscreen" :title="title">
    <template #title>
      <h3 class="tr-container__title">
        <slot name="title" :title="title">{{ title }}</slot>
      </h3>
    </template>
    <template #operation>
      <slot name="operation">
        <tr-icon-button :icon="IconNewSession" size="28" svgSize="20" @click="nextAgent.$conversation.createConversation()" />
        <tr-icon-button :icon="IconHistory" size="28" svgSize="20" @click="showHistory = !showHistory" />
        <tr-history
          v-if="showHistory"
          :data="nextAgent.$conversation.conversations"
          :show-rename-controls="isTouchDevice"
          :selected="nextAgent.$conversation.conversations.value[0]?.id"
          @item-click="(item) => nextAgent.$conversation.switchConversation(item)"
          @item-title-change="(newTitle, item) => nextAgent.$conversation.renameConversation(item, newTitle)"
          @item-action="(action, item) => action.id === 'delete' && nextAgent.$conversation.deleteConversation(item)"
        />
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
import { IconNewSession, IconHistory } from "@opentiny/tiny-robot-svgs";
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
  operation(props: {}): any;
  /** 默认插槽 ---- 包含欢迎信息 或者 智能体的聊天信息 */
  default(props: {}): any;
  /** 底部插槽 ---- 包含输入和发送按钮等 */
  footer(props: {}): any;
}>();
</script>
