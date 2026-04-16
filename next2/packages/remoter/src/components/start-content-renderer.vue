<template>
    <div class="start-content-renderer" v-if="message.content">
        <!-- 加载中， 尚没有steps时 -->
        <template v-if="!message.content || message.content.steps.length == 0">
            <BubbleRenderers.Loading :message="{}" :contentIndex="0" />
        </template>
        <!-- 有正常文本 -->
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
        <!-- 有错误文本 -->
        <template v-if="message.content.error">
            <div class="error-message">{{ message.content.error?.message || JSON.stringify(message.content.error) }}
            </div>
        </template>
        <!-- 流结束 -->
        <template v-if="!message.content.running">
            <div class="tiny-remoter-assistant-actions">
                <TrIconButton :icon="IconRefresh" data-title="重新对话" v-bounce.click @click="handleRefresh" />
                <TrIconButton :icon="IconCopy" data-title="复制" v-bounce.click @click="handleCopy" />
                <div class="token-usage-wrap" :title="tokenTitle" v-if="!autoHide">
                    <div v-for="(val, key) in tokenValues" :key="key" :class="key" :style="{ width: val[0] }"></div>
                </div>
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
import { computed, inject, ref } from 'vue';

const props = defineProps({
    message: {
        type: Object as PropType<{ content: StartContent }>,
        required: true,
    },
})

// 为了向其中注入result 属性
const store: any = inject(bubbleStoreKey);

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

function handleRefresh() {
    store.reChat();
}

async function handleCopy() {
    try {
        // 汇总每一步的内容， 忽略 ToolContent 的内容
        const textContent = props.message.content?.steps?.map((step) => step.contents?.map((item) => item.text || '').join('\n')).join('\n\n') || '';
        await navigator.clipboard.writeText(textContent)
    } catch (error) {
        console.error('复制失败:', error)
    }
}

// **************  token 限制  **************

// 如果没有totalTokens，则自动隐藏
const autoHide = computed(() => {
    return props.message.content?.totalUsage?.totalTokens === 0 || typeof props.message.content?.totalUsage?.totalTokens === 'undefined'
})

const tokenValues = computed(() => {
    const {
        inputTokens = 0,
        outputTokens = 0,
        totalTokens = 0,
        inputTokenDetails,
        outputTokenDetails
    } = props.message.content?.totalUsage || {}

    // 从新的嵌套结构中提取 token 数据
    const cachedInputTokens = inputTokenDetails?.cacheReadTokens || 0
    const reasoningTokens = outputTokenDetails?.reasoningTokens || 0

    return {
        cachedInputTokens: [(cachedInputTokens / totalTokens) * 100 + '%', cachedInputTokens],
        inputTokens: [((inputTokens - cachedInputTokens) / totalTokens) * 100 + '%', inputTokens],
        reasoningTokens: [(reasoningTokens / totalTokens) * 100 + '%', reasoningTokens],
        outputTokens: [((outputTokens - reasoningTokens) / totalTokens) * 100 + '%', outputTokens]
    }
})

const tokenTitle = computed(() => {
    const { inputTokens = 0, outputTokens = 0, totalTokens = 0, inputTokenDetails, outputTokenDetails } = props.message.content?.totalUsage || {}
    const cachedInputTokens = inputTokenDetails?.cacheReadTokens || 0
    const reasoningTokens = outputTokenDetails?.reasoningTokens || 0

    return [
        `inputTokens: ${inputTokens}`,
        `outputTokens: ${outputTokens}`,
        `totalTokens: ${totalTokens}`,
        `cachedInputTokens: ${cachedInputTokens}`,
        `reasoningTokens: ${reasoningTokens}`
    ].join('\n')
})
</script>
<style scoped>
/** 错误信息 */
.error-message {
    margin-top: 16px;
    color: var(--tr-color-error);
    font-size: var(--tr-font-size-xs);
}

.tiny-remoter-assistant-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

/** token 条 */
.token-usage-wrap {
    width: 120px;
    height: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    display: inline-flex;
    flex-direction: row;
    gap: 0;
    align-items: stretch;
}

.cachedInputTokens {
    background-color: #a0dcfd;
}

.inputTokens {
    background-color: #60b3fe;
}

.reasoningTokens {
    background-color: #ffc104;
}

.outputTokens {
    background-color: #0c70f3;
}
</style>