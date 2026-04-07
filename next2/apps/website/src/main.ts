import { registerOnPage } from "user";
import { z } from "zod";

import { Agent } from "agent";
import { createDeepSeek } from "@ai-sdk/deepseek";
  await registerOnPage({});

 
window._z = z;

const deepseek = createDeepSeek({
  apiKey: "sk-b462f8de7b364629b3136312c106655a",
  baseURL: "https://api.deepseek.com",
});

const agent = new Agent({
  model: deepseek("deepseek-chat"),
});

// await agent.chatStream({
//   role: "user",
//   content: "李白",
// });

console.log(agent);

window._agent = agent;
// _agent.$mcpServers.mcpServers.value.push({type:'page', name:'xxxx 系统' })