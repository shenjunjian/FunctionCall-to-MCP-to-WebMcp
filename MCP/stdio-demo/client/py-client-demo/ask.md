1. 使用MCP的官方  python sdk来实现MCP的client端,传输模式为 stdio。 MCP client中调用 get_weather 工具函数。 并告诉我如何启动MCP client。

使用 uv 安装的依赖包： mcp 

需要参考如下代码
```javascript
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

const serverScriptPath = "../../server/py-server-demo/server.py";
// const serverScriptPath = "../../server/js-server-demo/index.py";

async def connect_to_server(self, server_script_path: str):
    """Connect to an MCP server

    Args:
        server_script_path: Path to the server script (.py or .js)
    """
    is_python = server_script_path.endswith('.py')
    is_js = server_script_path.endswith('.js')
    if not (is_python or is_js):
        raise ValueError("Server script must be a .py or .js file")

    command = "python" if is_python else "node"
    server_params = StdioServerParameters(
        command=command,
        args=[server_script_path],
        env=None
    )

    stdio_transport = await self.exit_stack.enter_async_context(stdio_client(server_params))
    self.stdio, self.write = stdio_transport
    self.session = await self.exit_stack.enter_async_context(ClientSession(self.stdio, self.write))

    await self.session.initialize()

    # List available tools
    response = await self.session.list_tools()
    tools = response.tools
    print("\nConnected to server with tools:", [tool.name for tool in tools])
```

 