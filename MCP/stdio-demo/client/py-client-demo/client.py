from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import asyncio
from contextlib import AsyncExitStack

class McpClient:
    def __init__(self):
        self.exit_stack = AsyncExitStack()
        self.stdio = None
        self.write = None
        self.session = None

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

    async def get_weather(self, location: str):
        """Get weather information for a location

        Args:
            location: The location to get weather for
        """
        if not self.session:
            raise Exception("Not connected to server")

        response = await self.session.call_tool("get_weather", {"city": location})
        return response

    async def close(self):
        """Close the client connection"""
        await self.exit_stack.aclose()

async def main():
    client = McpClient()
    try:
        # Connect to the Python server
        # server_script_path = "../../server/py-server-demo/server.py"
        server_script_path = "../../server/js-server-demo/index.js"
        await client.connect_to_server(server_script_path)

        # Call get_weather tool
        location = "北京"
        print(f"\nGetting weather for {location}...")
        response = await client.get_weather(location)
        print(f"Weather response: {response}")

    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(main())
