# MCP Python Client Demo

This is a demo of MCP client using Python SDK with stdio transport.

## Prerequisites

- Python 3.7+
- uv (Python package manager)

## Installation

1. Install dependencies using uv:
   ```bash
   uv add mcp
   ```

## Usage

1. Make sure the MCP server is available. You can use either the Python server or JavaScript server from the server directory.

2. Run the client:
   ```bash
   python client.py
   ```

The client will:
1. Connect to the MCP server
2. List available tools
3. Call the `get_weather` tool with location "Beijing"
4. Print the weather response

## Configuration

To change the server script path, modify the `server_script_path` variable in `client.py`:

```python
# For Python server
server_script_path = "../../server/py-server-demo/server.py"

# For JavaScript server
# server_script_path = "../../server/js-server-demo/index.js"
```
