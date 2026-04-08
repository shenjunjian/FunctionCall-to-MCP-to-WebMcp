import { jsonSchema, tool, type ToolSet } from "ai";

/** 构建本window页面的工具集 */
export function buildPageTools() {
  const client = navigator.modelContextTesting!;
  const tools: ToolSet = {};
  client.listTools().forEach((currTool) => {
    tools[currTool.name] = tool({
      description: currTool.description,
      inputSchema: jsonSchema(JSON.parse(currTool.inputSchema as string)),
      // params是入参， aiContext 包含了 {toolCallId, messages,abortSignal}
      execute: async (params: any, aiContext: any) => {
        return client.executeTool(currTool.name, JSON.stringify(params)); // webmcp规范， 参数要字符串化。
      },
    });
  });

  return tools;
}
