import { registerOnPage } from "agent";
import { z } from "zod";

import { NextAgent } from "agent";
import { createDeepSeek } from "@ai-sdk/deepseek";
await registerOnPage({
  name: "xxxx 系统",
  iframeAble: true,
});

window._z = z;

const deepseek = createDeepSeek({
  apiKey: "sk-b462f8de7b364629b3136312c106655a",
  baseURL: "https://api.deepseek.com",
});

const agent = new NextAgent({
  model: deepseek("deepseek-chat"),
});

// await agent.chatStream({
//   role: "user",
//   content: "李白",
// });

console.log("主页面agent", agent);

window._agent = agent;
// _agent.$mcpServers.mcpServers.value.push({type:'page', name:'xxxx 系统' })

navigator.modelContext.registerTool({
  name: "get-color",
  description: "获取当前颜色",
  inputSchema: { type: "object", properties: {} },
  async execute() {
    return {
      content: [
        {
          type: "text",
          text: `当前红色, from buildin-modelcontext`,
        },
      ],
    };
  },
});
await agent.$mcpServers.addMcpServer({ type: "page", name: "xxxx 系统" });

// _agent.chatStream({
//   role: "user",
//   content: "现在颜色是什么",
// });
