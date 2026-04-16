<template>
    <div class="start-content-renderer" v-if="message.content">
        <div v-for="(step, stepIdx) in message.content.steps" :key="stepIdx">
            <div v-for="(item, itemIdx) in step.contents" :key="item.id">
                <BubbleRenderers.Markdown v-if="item.type == 'text'" :message="{ ...item, content: item.text }"
                    :contentIndex="itemIdx" />
                <BubbleRenderers.Reasoning v-else-if="item.type == 'reasoning'"
                    :message="{ ...item, reasoning_content: item.text, state: { thinking: item.running, open: true } }"
                    :contentIndex="itemIdx" />
                <BubbleRenderers.Tools v-else-if="item.type == 'tool'" :message="genToolMessage(item)"
                    :contentIndex="itemIdx" />
            </div>
        </div>
        <template v-if="message.content.error">
            <div class="error-message">{{ message.content.error?.message || JSON.stringify(message.content.error) }}
            </div>
        </template>
        <template v-if="!message.content.running">
            <div class="assistant-actions">
                <TrIconButton :icon="IconRefresh" data-title="刷新" v-bounce.click @click="handleRefresh" />
                <TrIconButton :icon="IconCopy" data-title="复制" v-bounce.click @click="handleCopy" />
            </div>
        </template>

    </div>
</template>
<script setup lang="ts">
import { BubbleRenderers, TrIconButton } from '@opentiny/tiny-robot';
import { IconRefresh, IconCopy } from '@opentiny/tiny-robot-svgs';
import type { StartContent, ToolContent } from 'next-agent/src/streamVisitor';
import type { PropType } from 'vue';
import { bubbleStoreKey } from '../utils/const';
import { vBounce } from './v-debounce';
import { inject, ref } from 'vue';

// 为了向其中注入result 属性
const store: any = inject(bubbleStoreKey);

const props = defineProps({
    message: {
        type: Object as PropType<{ content: StartContent }>,
        required: true,
    },
})

function genToolMessage(item: ToolContent) {
    const input = item?.inputStr || '';
    const output = item?.output?.content ? JSON.stringify(item.output.content) : '';

    store.toolCallResults[item.id] = output;

    return {
        content: '',
        loading: item.running,
        state: { toolCall: { [item.id]: { open: true, status: item.running ? 'running' : undefined } } },
        tool_calls: [{ id: item.id, type: 'function', function: { arguments: input, name: item.toolName } }],
    }
}

/** 跳动动画 */
const refreshing = ref(false);
const copying = ref(false);

function handleRefresh() {
    refreshing.value = true;
}

async function handleCopy() {
    try {
        // 汇总每一步的内容， 忽略 ToolContent 的内容
        const textContent = props.message.content?.steps?.map((step) => step.contents?.map((item) => item.text || '').join('\n')).join('\n\n') || '';
        await navigator.clipboard.writeText(textContent)
        copying.value = true;
    } catch (error) {
        console.error('复制失败:', error)
    }

}
</script>
<style scoped>
.error-message {
    margin-top: 16px;
    color: var(--tr-color-error);
    font-size: var(--tr-font-size-xs);
}
</style>