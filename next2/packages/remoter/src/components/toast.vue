<template>
    <div class="toast-container">
        <div v-for="(message, index) in messages" :key="index" class="toast-item" @mouseenter="clearTimer(index)"
            @mouseleave="startTimer(index)">
            <IconError style="font-size: 20px; margin-right: 5px; color:red; " />
            <span style="line-height: 20px;">{{ message }}</span>
        </div>
    </div>
</template>
<script setup lang="ts">
import { watch, onUnmounted } from 'vue';
// 实现一个 toast提示组件， 它接收 messages 的双向绑定的消息数据和 延时消息消失的属性，默认3秒消失最近进来的一个消息。
// 整个组件的样式是sticky 定位在右上角，距顶50px, 右20px; 每个消息渲染为一个块，有阴影效果，不需要手动关闭效果。
// 鼠标移入消息块，消息块不消失。 
const props = defineProps({
    messages: {
        type: Array,
        default: () => [],
    },
    duration: {
        type: Number,
        default: 3000,
    },
});

const emit = defineEmits<{
    (e: 'update:messages', value: string[]): void;
}>();

const timers = ref<number[]>([]);

const clearTimer = (index: number) => {
    if (timers.value[index]) {
        clearTimeout(timers.value[index]);
    }
};

const startTimer = (index: number) => {
    if (index === props.messages.length - 1) {
        timers.value[index] = setTimeout(() => {
            const newMessages = [...props.messages];
            newMessages.splice(index, 1);
            emit('update:messages', newMessages);
        }, props.duration);
    }
};

watch(() => props.messages, (newMessages) => {
    // 清除所有旧的定时器
    timers.value.forEach(timer => clearTimeout(timer));
    timers.value = [];

    // 为最新的消息设置定时器
    if (newMessages.length > 0) {
        const lastIndex = newMessages.length - 1;
        startTimer(lastIndex);
    }
}, { deep: true });

onUnmounted(() => {
    // 组件卸载时清除所有定时器
    timers.value.forEach(timer => clearTimeout(timer));
});
</script>

<style scoped>
.toast-container {
    position: sticky;
    top: 50px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
}

.toast-item {
    background-color: white;
    padding: 12px 16px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    max-width: 300px;
    word-wrap: break-word;
    animation: slideIn 0.3s ease-out;
    display: flex;
    align-items: center;
    transition: all 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(100%);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>