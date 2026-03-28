## WebMcp的定义：

传统MCP是寄宿在 express 框架，以Web server的形式提供服务。服务中注册的工具是在`系统`中运行的，最终返回文本格式的结果。
WebMcp则是希望有种服务能寄宿在`浏览器`中，这样服务中注册的工具可以直接访问页面，甚至与页面开发时的上下文数据，service api 直接交互,具有 100%的网页操控，最终返回操控的结果。

## 类型：

1. 浏览器原生 WebMcp： 实验性的 navigator.modelContext， chrome 浏览器已支持 。 它实例存在于浏览上下文的整个生命周期内，页面导航离开或关闭会自动销毁。
   https://deepwiki.com/webmachinelearning/webmcp
2. WebMcp 库： 比如 @opentiny/next-sdk @mcp-b/transports
