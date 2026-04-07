import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server instance
const server = new McpServer(
  {
    name: "weather",
    version: "1.0.0",
  },
  {
    capabilities: { tools: {} },
  },
);

// 注册工具
// server.registerTool(
//   "get_weather",
//   {
//     description: "查询指定城市的天气信息",
//     inputSchema: z.object({
//       city: z.string().describe("城市名称"),
//     }),
//   },
//   async (input) => {
//     // 模拟天气数据
//     const mockWeatherData = {
//       北京: { temperature: 25, condition: "晴", humidity: 60 },
//       上海: { temperature: 28, condition: "多云", humidity: 70 },
//       广州: { temperature: 30, condition: "晴", humidity: 75 },
//       深圳: { temperature: 29, condition: "晴", humidity: 72 },
//       杭州: { temperature: 26, condition: "多云", humidity: 65 },
//     };

//     // 检查城市是否在模拟数据中
//     if (mockWeatherData[input.city]) {
//       return {
//         content: [
//           {
//             type: "text",
//             text: `当前 ${input.city} 的天气是 ${mockWeatherData[input.city].condition}，温度是 ${mockWeatherData[input.city].temperature}摄氏度，湿度是 ${mockWeatherData[input.city].humidity}%`,
//           },
//         ],
//       };
//     } else {
//       // 对于不在模拟数据中的城市，返回默认值
//       return {
//         content: [
//           {
//             type: "text",
//             text: `当前 ${input.city} 的天气信息不存在`,
//           },
//         ],
//       };
//     }
//   },
// );
let count = 0;
server.tool("get_weather", {}, () => {
  return {
    content: [
      {
        type: "text",
        text: "查询指定城市的天气信息" + count++,
      },
    ],
  };
});
// 启动server
async function startServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP server started successfully with stdio transport");
  } catch (error) {
    console.error(
      "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-----Failed to start MCP server:",
      error,
    );
  }
}

await startServer();
