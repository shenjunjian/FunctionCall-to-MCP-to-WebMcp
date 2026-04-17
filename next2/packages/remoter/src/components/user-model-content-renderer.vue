<template>
    <div class="user-model-content-renderer" v-if="message.content">
        <div v-if="typeof message.content == 'string'">
            <BubbleRenderers.Markdown :message="{ content: message.content }" :contentIndex="0" />
        </div>
        <template v-else>
            <!-- 有正常文本 -->
            <div v-for="(item, itemIdx) in message.content" :key="itemIdx">
                <BubbleRenderers.Markdown v-if="item.type == 'text'" :message="{ ...item, content: item.text }"
                    :contentIndex="itemIdx" />
                <BubbleRenderers.Image v-else-if="item.type == 'image'"
                    :message="{ content: [{ type: 'image_url', image_url: { url: arrayBufferToImageUrl(item.image) } }] }"
                    :contentIndex="itemIdx" />
            </div>
        </template>
    </div>
</template>
<script setup lang="ts">
import { BubbleRenderers } from '@opentiny/tiny-robot';
import { onUnmounted, type PropType } from 'vue';
import type { UserModelMessage } from 'ai';

const props = defineProps({
    message: {
        type: Object as PropType<{ content: UserModelMessage['content'] }>,
        required: true,
    },
})

// 缓存形式的转换 arraybuffer -> base64
const cache = new Map();

const arrayBufferToImageUrl = (arrayBuffer: ArrayBuffer) => {
    if (cache.has(arrayBuffer)) return cache.get(arrayBuffer);

    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' }); // 可根据实际情况指定MIME类型
    cache.set(arrayBuffer, URL.createObjectURL(blob));
    return cache.get(arrayBuffer);
}

onUnmounted(() => {
    cache.forEach((url) => URL.revokeObjectURL(url));
    cache.clear();
})

</script>
<style scoped></style>