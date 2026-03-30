<script setup lang="ts">
import { onMounted, ref } from "vue";

import { setupWebMcpServer, setupWebMcpClient } from "./webmcp";
const currentTools = ref<ToolsType>([]);

import { setupWebMcpServer, setupWebMcpClient } from "./webmcp";

const webMcpServer = await setupWebMcpServer();
const webMcpClient = await setupWebMcpClient();
// APP中， 初始化一个内存通道的双方。
// 1、其中client 负责连接到远端。
// 2、其中server 负责不停的添加工具，详见 helloWorld组件。

type ToolsType = Awaited<ReturnType<typeof webMcpClient.listTools>>["tools"];

// 2.  刷新工具列表，做展示层UI
function refreshTool() {
  webMcpClient.listTools().then((tools) => {
    console.log(tools);
    currentTools.value = tools.tools;
  });
}

// 3.  调用工具
function callTool(tool: ToolsType[0]) {
  webMcpClient.callTool({ name: tool.name, arguments: {} }).then((result) => {
    alert(JSON.stringify(result));
  });
}

onMounted(async () => {
  refreshTool();
});
</script>

<template>
  <div class="tool-container">
    <h3 @click="refreshTool">remoter:当前工具</h3>
    <ul>
      <li v-for="tool in currentTools" :key="tool.name" @click="callTool(tool)">
        {{ tool.name }} - {{ tool.description }}
      </li>
    </ul>
  </div>
</template>

<style lang="css" scoped>
h3,
li {
  cursor: pointer;
}

li {
  text-align: left;
}
</style>
