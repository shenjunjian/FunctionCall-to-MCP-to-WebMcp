# 用户智能化应用层

## 目的

- 提供用户智能化的必要接口

## 范围

1. 普通页面（同一page,或 iframe的情况）
2. 远程遥控能力

## 提供支持

1. 普通页面，只建议使用安装 @mcp-b/webmcp-polyfill @mcp-b/webmcp-types 包，然后使用标准的 WebMCP 接口。

```ts
import { initializeWebMCPPolyfill } from "@mcp-b/webmcp-polyfill";

interface RegisterOnWPageOption {
  /** TODO: 待分析需要什么参数 */
  onError?: (error: Error) => void;
}

function registerOnPage(option: RegisterOnWPageOption) {
  initializeWebMCPPolyfill();

  // 创建一个内存transport pair, 代理 WebMCP 接口
  // 这样访问标准的mcpClient，就是在访问页面的 modelContestTesting
}
```

2. 远程遥控能力，提供一个函数，让它接入远程的WebAgent服务器。

```ts
interface RegisterOnWebAgentOption {
  /** 远程遥控的页面url */
  url: string;
  /** 远程遥控的会话id,可选 */
  sessionId?: string;
  /** Transport上的错误回调 */
  onError?: (error: Error) => void;
}

function registerOnWebAgent(option: RegisterOnWebAgentOption) {
  // 远程遥控的实现

  return {
    sessionId,
  };
}
```

3. 文档讲2块内容，

工具如何管理：通用级，页面级

jsonSchema如何定义：
标准是什么， zod@3 zod@4。 如何中断询问，如何继续询问。 如何返回结构化数据
