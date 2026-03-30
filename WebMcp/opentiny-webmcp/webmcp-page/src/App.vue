<script setup lang="ts">
import { onMounted, ref } from "vue";
import HelloWorld from "./components/HelloWorld.vue";

import {
  setupWebMcpServer,
  setupWebMcpClient,
} from "../../webmcp-iframe/src/webmcp";

// 1.  初始化WebMCP服务器和客户端
const webMcpServer = setupWebMcpServer();
const webMcpClient = setupWebMcpClient();

type ToolsType = Awaited<ReturnType<typeof webMcpClient.listTools>>["tools"];
const currentTools = ref<ToolsType>([]);

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

onMounted(() => {
  refreshTool();
});
</script>

<template>
  <HelloWorld />

  <div class="tool-container">
    <h3 @click="refreshTool">当前工具</h3>
    <ul>
      <li v-for="tool in currentTools" :key="tool.name" @click="callTool(tool)">
        {{ tool.name }} - {{ tool.description }}
      </li>
    </ul>
  </div>
</template>

<style lang="css" scoped>
.tool-container {
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
h3,
li {
  cursor: pointer;
}

li {
  text-align: left;
}
</style>
