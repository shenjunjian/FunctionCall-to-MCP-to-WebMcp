1. 使用MCP的官方python sdk来实现MCP的server端,传输模式为 stdio。 MCP server中包含一个模拟的天气查询的工具函数。

使用 uv 进行依赖管理, 并告诉我如何启动MCP server
uv 安装项目依赖项的命令为：  uv add mcp[cli] httpx

示例代码如下：
```python
import httpx
from mcp.server.fastmcp import FastMCP

@mcp.tool()
async def get_forecast(city: str) -> str:
    # 模拟查询天气
    return f"当前 {city} 的天气是晴，20-28℃，微风"

mcp.run(transport="stdio")
```