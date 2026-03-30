<script setup lang="ts">
import { onMounted } from "vue";
import HelloWorld from "./components/HelloWorld.vue";

import { setupWebMcpServer, setupWebMcpClient } from "./webmcp";

// APP中， 初始化一个内存通道的双方。
// 1、其中client 负责连接到远端。
// 2、其中server 负责不停的添加工具，详见 helloWorld组件。
onMounted(async () => {
  const webMcpServer = await setupWebMcpServer();
  const webMcpClient = await setupWebMcpClient();
});
</script>

<template>
  <HelloWorld />
</template>
