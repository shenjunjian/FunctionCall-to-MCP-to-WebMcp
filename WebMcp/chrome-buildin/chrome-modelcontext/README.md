1. chrome 146+ ，打开开关： chrome://flags/#enable-webmcp-testing。 ------------ 不打开也可以，好像默认已经开启了。
2. chrome://inspect/#remote-debugging，打开调试模式。 -------------------------- 这样配置mcpServer时，可以配置 --auto-connect, 就不再打开 测试版本的chrome了。

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--args=\"--enable-webmcp-testing  --enable-features=WebMCP\"",
        "--auto-connect"
      ]
    }
  }
}
```
