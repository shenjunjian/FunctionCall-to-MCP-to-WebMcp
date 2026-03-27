# Function Calling Demo

## 项目说明
这是一个使用 JavaScript 实现的 Function Calling 示例，工具是查询天气，返回 MOCK 的天气信息。

## 大模型配置信息
请在 index.js 文件中替换以下配置：

- `baseUrl`: 大模型 API 的基础 URL
- `apiKey`: 大模型 API 的访问密钥
- `modelId`: 要使用的大模型 ID

## 安装依赖
使用 pnpm 安装依赖：

```bash
pnpm install
```

## 启动命令

```bash
pnpm start
```

## 功能说明
- 实现了天气查询工具 `getWeather`，返回 MOCK 天气数据
- 使用 axios 调用大模型 API
- 支持 Function Calling 机制，大模型可以自动调用天气查询工具
