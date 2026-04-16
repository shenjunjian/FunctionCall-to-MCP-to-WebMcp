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
    </div>
</template>
<script setup lang="ts">
import { BubbleRenderers } from '@opentiny/tiny-robot';
import type { StartContent, ToolContent } from 'next-agent/src/streamVisitor';
import type { PropType } from 'vue';
import { bubbleStoreKey } from '../utils/const';
import { inject } from 'vue';

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
</script>
<style scoped lang="scss"></style>