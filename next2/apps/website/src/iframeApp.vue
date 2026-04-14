<script setup lang="ts">
import { TinyRemoter } from "next-remoter";
import { NextAgent } from "next-agent";
import { createDeepSeek } from "@ai-sdk/deepseek";

const deepseek = createDeepSeek({
  apiKey: "sk-b462f8de7b364629b3136312c106655a",
  // baseURL: "https://api.deepseek.com",
  baseURL: "http://localhost:1234/v1",
});

const agent = new NextAgent({
  model: deepseek("google/gemma-4-26b-a4b"),
  // model: deepseek("deepseek-chat"),
});

console.log("iframe 页面agent", agent);

window._agent = agent;

setTimeout(() => {
  // agent.$mcpServers.addMcpServer({
  //   type: "streamable-http",
  //   url: "http://localhost:3000/api/v1/webmcp/mcp?sessionId=sk-next2-demo",
  //   name: "xxxx 系统",
  // });
  agent.$mcpServers.addMcpServer({ type: "iframe", name: "xxxx 系统" });
}, 2000);

// _agent.chatStream({
//   role: "user",
//   content: "现在颜色是什么",
// });
</script>

<template>
  <tiny-remoter :next-agent="agent" :show="true" :fullscreen="false" title="xxxx 系统">
    <template #title="{ title }"> ***{{ title }} **** </template>
  </tiny-remoter>
</template>

<style>
/* 隐藏拖动条. robot未实现的功能 */
.tr-container__dragging-bar-wrapper {
  display: none !important;
}
</style>
<style scoped></style>
