# Function Calling 天气查询示例

这是一个使用 Python 实现的 Function Calling 例子，用于查询天气信息，使用了 OpenAI 客户端和 DeepSeek 大模型。

## 功能说明
- 实现了一个 `get_weather` 工具函数，用于查询指定城市的天气信息
- 包含 MOCK 天气数据，支持北京、上海、广州、深圳、杭州等城市
- 使用 OpenAI 客户端与 DeepSeek 大模型进行交互，实现真正的 Function Calling
- 支持多轮对话，保持对话上下文

## 项目结构
```
py-demo/
├── main.py          # 主脚本
├── pyproject.toml   # 项目配置文件
├── uv.lock          # 依赖锁定文件
└── README.md        # 项目说明文件
```

## 依赖项
- Python 3.13+
- openai 库

## 安装依赖
```bash
uv add openai
```

## 运行方法

1. 确保已安装 Python 3.13+
2. 进入项目目录：
   ```bash
   cd e:\FunctionCall-to-MCP-to-WebMcp\FuncionCall\py-demo
   ```
3. 安装依赖：
   ```bash
   uv add openai
   ```
4. 运行脚本：
   ```bash
   uv run main.py
   ```

## 使用示例
```
欢迎使用天气查询助手！
您可以输入类似：'北京的天气怎么样？' 来查询天气
输入 '退出' 结束对话
请输入您的问题：北京的天气怎么样？
北京的天气：晴，20-28℃，微风
请输入您的问题：上海的天气
上海的天气：多云，18-25℃，东风3级
请输入您的问题：退出
再见！
```

## 技术说明
- 使用 OpenAI 客户端与 DeepSeek 大模型进行交互
- 工具定义遵循 OpenAI Function Calling 的格式
- 包含完整的工具调用流程，包括工具调用、结果返回和最终响应生成
- 大模型配置信息从项目根目录的 readme.md 文件中获取