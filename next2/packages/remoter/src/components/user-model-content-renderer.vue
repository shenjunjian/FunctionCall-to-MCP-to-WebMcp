<template>
    <div class="user-model-content-renderer" v-if="message.content">
        <div v-if="typeof message.content == 'string'">
            <BubbleRenderers.Markdown :message="{ content: message.content }" :contentIndex="0" />
        </div>
        <template v-else>
            <!-- 有正常文本 -->
            <div v-for="(item, itemIdx) in message.content" :key="itemIdx">
                <BubbleRenderers.Markdown v-if="item.type == 'text' && itemIdx == contentIndex"
                    :message="{ ...item, content: item.text }" :contentIndex="itemIdx" />
                <!-- <BubbleRenderers.Image v-else-if="item.type == 'image'"
                    :message="{ content: [{ type: 'image_url', image_url: { url: arrayBufferToImageUrl(item.image) } }] }"
                    :contentIndex="itemIdx" /> -->
                <img v-else-if="item.type == 'image' && itemIdx == contentIndex" class="tr-bubble__image" loading="lazy"
                    :src="item.image" alt="image" data-type="image" />

                <TrAttachments v-else-if="item.type == 'file' && itemIdx == contentIndex" :data-type="item.mediaType"
                    variant="card" :actions="[]"
                    :items="[{ url: item.data, size: item.size, name: item.filename, fileType: item.mediaType.split('/')[0], status: 'success' }]">
                </TrAttachments>
            </div>
        </template>
    </div>
</template>
<script setup lang="ts">
import { BubbleRenderers, TrAttachments } from '@opentiny/tiny-robot';
import { type PropType } from 'vue';
import type { UserModelMessage } from 'ai';

const props = defineProps({
    message: {
        type: Object as PropType<{ content: UserModelMessage['content'] }>,
        required: true,
    },
    contentIndex: {
        type: Number,
    },
})
</script>
<style scoped>
.tr-bubble__image {
    max-width: var(--tr-bubble-image-max-width);
    max-height: var(--tr-bubble-image-max-height);
    min-width: 120px;
    min-height: 120px;
    border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>