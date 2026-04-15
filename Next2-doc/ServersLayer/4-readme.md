# webMcpServer 层

什么可以是webMcpServer？

- 普通页面（同一page,或 iframe的情况）的 modelContextTesting
- 远程遥控能力 : {url: string, type?: string,}
- 应用场景的标准的mcpServer
- Agent层的多代理 ，每个子代理是一个server
- 扩展内的能力也是server, 例如： 标签，无障碍，消息通信等。
- webSkills 也是server
- webSearch 待增加 联网查询能力。
- 图片识别能力

所以它的配置必须规范化：

```ts
{
    type: 'httpstream'|'page'|'memory',
    url?:string
    window?: Window,
    tools:[
        {
            name: string,
            description: string,
            inputSchema: any,
             execute: (args: any) => Promise<any>,
        }
    ]

}
```

```ts
{
    type: 'image',
    url: string,
    type?: string,
}
```

> 最大的痛，是基于浏览器的agent, 无法引用 stdio 类型的mcpServer。
 比如 ： chrome devtools mcp 工具，就只允许npx chrome-devtools-mcp@latest。
