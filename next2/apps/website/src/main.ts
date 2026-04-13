import { registerOnPage, NextAgent } from "next-agent";
import { z } from "zod";

import { createDeepSeek } from "@ai-sdk/deepseek";
await registerOnPage({
  name: "xxxx 系统",
  iframeAble: true,
  webAgentAble: false,
  url: "http://localhost:3000/api/v1/webmcp/mcp",
  sessionId: "sk-next2-demo",
});

window._z = z;

const deepseek = createDeepSeek({
  apiKey: "sk-b462f8de7b364629b3136312c106655a",
  // baseURL: "https://api.deepseek.com",
  baseURL: "http://localhost:1234/v1",
});

const agent = new NextAgent({
  model: deepseek("google/gemma-4-26b-a4b"),
  // model: deepseek("deepseek-chat"),
});

console.log("主页面agent", agent);

window._agent = agent;

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
// await agent.$mcpServers.addMcpServer({ type: "page", name: "xxxx 系统" });

// navigator.modelContext.registerTool({
//   name: "get-random",
//   description: "获取随机信息",
//   inputSchema: {
//     type: "object",
//     properties: {
//       count: {
//         type: "integer",
//         description: "需要的随机数的个数，范围从1到5, 最多返回5个随机数",
//       },
//     },
//   },
//   async execute(params) {
//     const { count } = params as any;
//     if (count < 1 || count > 5) {
//       throw new Error("count must be between 1 and 5");
//     }
//     const randomNumbers = Array.from({ length: count }, (_, i) =>
//       Math.floor(Math.random() * 100),
//     );

//     return {
//       content: [
//         {
//           type: "text",
//           text: `${JSON.stringify(randomNumbers)}`,
//         },
//       ],
//     };
//   },
// });

// _agent.chatStream({
//   role: "user",
//   content: "现在颜色是什么",
// });
