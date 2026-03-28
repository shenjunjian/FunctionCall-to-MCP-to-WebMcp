<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
</script>

<template>
  <HelloWorld />
  <iframe id="iframe" src="/iframe" frameborder="0"></iframe>
</template>
<style scoped>
#iframe {
  position: fixed;
  top: 20px;
  left: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 20px;
  min-width: 200px;
  z-index: 100;
  /* 添加卡片悬浮效果 */
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  margin: 20px;
}
</style>
