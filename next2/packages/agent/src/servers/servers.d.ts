interface BaseServer {
  id?: string;
  name: string;
}

/** 同页面服务 */
export interface PageServer extends BaseServer {
  type: "page";
  /** 服务名称 */
  name: string;
}

/** iframe 服务 */
export interface IframeServer extends BaseServer {
  type: "iframe";
  /** 服务名称 */
  name: string;
}

export interface StreamableHttpServer extends BaseServer {
  type: "streamable-ttp";
  /** 服务名称 */
  name: string;
  /** 会话id */
  url: string;
}

export interface SSEServer extends BaseServer {
  type: "sse";
  /** 服务名称 */
  name: string;
  /** 会话id */
  url: string;
}

export type NextMcpServer =
  | PageServer
  | IframeServer
  | StreamableHttpServer
  | SSEServer;
