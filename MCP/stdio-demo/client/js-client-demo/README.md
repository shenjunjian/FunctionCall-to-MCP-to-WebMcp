# MCP Client Demo

This is a demo of MCP client using the official TypeScript SDK with stdio transport.

## Prerequisites

- Node.js
- pnpm

## Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the project:
   ```bash
   pnpm run build
   ```

## How to Start MCP Client

1. Make sure you have a MCP server running. You can use the Python server demo at `../../server/py-server-demo/server.py`.

2. Start the client:
   ```bash
   pnpm run start
   ```

3. The client will connect to the server and test the weather query tool with the city "北京".

## Project Structure

- `src/index.ts`: Main client code
- `dist/`: Compiled JavaScript files
- `package.json`: Project configuration
- `tsconfig.json`: TypeScript configuration

## Features

- Uses MCP official TypeScript SDK
- Stdio transport mode
- Includes a mock weather query tool function