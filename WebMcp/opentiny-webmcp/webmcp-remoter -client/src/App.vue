<script setup lang="ts">
import { onMounted, ref } from "vue";
import { WebMcpClient } from "@opentiny/next-sdk";
import { setupWebMcpClient, setupMcpClient } from "./webmcp";
import { Client } from "@modelcontextprotocol/sdk/client/index";
const currentTools = ref<ToolsType>([]);

let webMcpClient: WebMcpClient | Client;
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
  // 1.  初始化客户端
  // webMcpClient = await setupWebMcpClient();
  webMcpClient = await setupMcpClient();
  refreshTool();
});
</script>

<template>
  <div class="tool-container">
    <h3 @click="refreshTool">RemoterClient: 远端当前工具</h3>
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
