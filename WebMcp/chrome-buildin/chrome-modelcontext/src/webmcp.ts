// 注册原生的工具
export function registerTools() {
  navigator.modelContext.registerTool({
    name: "get-time",
    description: "获取当前时间",
    inputSchema: { type: "object", properties: {} },
    async execute() {
      return {
        content: [
          {
            type: "text",
            text: `当前时间是：${new Date().toLocaleString()}, from buildin-modelcontext`,
          },
        ],
      };
    },
  });
}
