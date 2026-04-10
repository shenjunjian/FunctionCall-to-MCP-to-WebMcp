interface BaseServer {
  /** 服务id */
  id?: string;
  /** 服务名称 */
  name: string;
  /** 动态更新的服务工具集 */
  tools?: ToolSet;
}

/** 同页面服务, 每个Agent中只能有一个。 */
export interface PageServer extends BaseServer {
  type: "page";
}

/** iframe 服务, 每个Agent中只能有一个。 */
export interface IframeServer extends BaseServer {
  type: "iframe";
  /** iframe连接时，约定的endpoint 名称, 默认值为 "endpoint" */
  endpoint?: string;
}

export interface StreamableHttpServer extends BaseServer {
  type: "streamable-http";
  /** 请求url, 可包含sessionId */
  url: string;
  /** 请求头 */
  headers?: Record<string, string>;
}

export interface SSEServer extends BaseServer {
  type: "sse";
  /** 请求url, 可包含sessionId */
  url: string;
  /** 请求头 */
  headers?: Record<string, string>;
}

export type NextMcpServer =
  | PageServer
  | IframeServer
  | StreamableHttpServer
  | SSEServer;
