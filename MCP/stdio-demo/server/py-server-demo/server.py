import httpx
from mcp.server.fastmcp import FastMCP

app = FastMCP()

@app.tool()
async def get_forecast(city: str) -> str:
    # 模拟查询天气
    return f"当前 {city} 的天气是晴，20-28℃，微风"

app.run(transport="stdio")