# webMcpServer 层

什么可以是webMcpServer？

- 普通页面（同一page,或 iframe的情况）的 modelContextTesting
- 远程遥控能力 : {url: string, type?: string,}
- 应用场景的标准的mcpServer
- Agent层的多代理 ，每个子代理是一个server
- 扩展内的能力也是server, 例如： 标签，无障碍，消息通信等。

所以它的配置必须规范化：

```ts
{
    type: 'httpstream'|'page'|'memory',
    url?:string
}
```
