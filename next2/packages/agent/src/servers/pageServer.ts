import { jsonSchema, tool, type ToolExecutionOptions, type ToolSet } from "ai";
import type { PageServer } from "./servers";

/** 构建本window页面的工具集 */
export function buildPageTools(server: PageServer) {
  try {
    const client = navigator.modelContextTesting!;
    const tools: ToolSet = {};
    client.listTools().forEach((currTool) => {
      tools[currTool.name] = tool({
        description: currTool.description,
        inputSchema: jsonSchema(JSON.parse(currTool.inputSchema as string)),
        // params是入参， aiContext 包含了 {toolCallId, messages,abortSignal}
        execute: async (params: any, aiContext: ToolExecutionOptions) => {
          return client.executeTool(currTool.name, JSON.stringify(params)); // webmcp规范， 参数要字符串化。
        },
      });
    });
    server.tools = tools;
    return tools;
  } catch (error) {
    console.error("buildPageTools error", error);
  }
}
