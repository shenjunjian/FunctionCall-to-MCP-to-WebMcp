<template>
    <div class="start-content-renderer" v-if="message.content">
        <div v-for="(step, stepIdx) in message.content.steps" :key="stepIdx">
            <div v-for="(item) in step.contents" :key="item.id">
                <BubbleRenderers.Markdown v-if="item.type == 'text'" :message="{ ...item, content: item.text }"
                    :contentIndex="item.id" />
                <BubbleRenderers.Reasoning v-else-if="item.type == 'reasoning'"
                    :message="{ ...item, reasoning_content: item.text, state: { thinking: item.running, open: true } }"
                    :contentIndex="item.id" />
                <BubbleRenderers.Tool v-else-if="item.type == 'tool'" :message="genToolMessage(item)"
                    :contentIndex="item.id" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { BubbleRenderers } from '@opentiny/tiny-robot';
import type { ToolContent } from 'next-agent/src/streamVisitor';

const props = defineProps({
    message: {
        type: Object,
        required: true,
    },
})

function genToolMessage(item: ToolContent) {
    const output = item?.output?.content?.[0]?.text || '';

    return {
        content: '', loading: item.running,
        state: { toolCall: { call_0: { open: true, status: item.running ? 'running' : undefined } } },
        tool_calls: [{ id: 'call_0', type: 'function', function: { arguments: { input: item.inputStr, output: output }, name: item.toolName } }]
    }
}
</script>
<style scoped lang="scss"></style>