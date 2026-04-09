import { NextAgent } from "agent";
import { createDeepSeek } from "@ai-sdk/deepseek";

const deepseek = createDeepSeek({
  apiKey: "sk-b462f8de7b364629b3136312c106655a",
  baseURL: "https://api.deepseek.com",
});

const agent = new NextAgent({
  model: deepseek("deepseek-chat"),
});

console.log("iframe 页面agent", agent);

window._agent = agent;

// agent.$mcpServers.mcpServers.value.push({ type: "iframe", name: "xxxx 系统" });
await agent.$mcpServers.addMcpServer({ type: "iframe", name: "xxxx 系统" });

// _agent.chatStream({
//   role: "user",
//   content: "现在颜色是什么",
// });
