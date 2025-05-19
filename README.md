# Iconify MCP Server

A Model Context Protocol (MCP) server that provides access to Iconify's extensive collection of icons through Claude and other MCP-compatible AI assistants.

## What is Iconify?

Iconify is a unified icon framework that provides access to over 200,000 icons from more than 150 open-source icon sets. With Iconify, you can:

- Use icons from multiple icon sets with a consistent API
- Load icons on demand - only fetch the icons you actually use
- Implement icons with your preferred framework (React, Vue, Svelte, etc.)
- Avoid layout shifts with proper CSS configuration

## Features

This MCP server provides:

- 🔍 **Icon search** - Find icons matching your search terms
- 📋 **Implementation snippets** - Get ready-to-use code for your framework
- 📚 **Framework support** - React, Vue, Svelte, Lit, Ember, Web Components, and more
- 🎨 **Customization guidance** - Learn how to style and modify icons
- 📐 **Layout shift prevention** - CSS snippets to avoid UI jumps
- ⚙️ **Framework-specific configurations** - Including enhanced unplugin-icons support

## Getting Started

### Installation

```bash
# Clone this repository
git clone https://github.com/yourusername/iconify-mcp
cd iconify-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Usage with Claude Desktop

1. Start the server:
   ```bash
   npm start
   ```

2. Configure Claude Desktop to use the server:
   
   Open your Claude Desktop configuration file:
   
   **macOS/Linux**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
   **Windows**: `%AppData%\Claude\claude_desktop_config.json`

   Add this server to your configuration:

   ```json
   {
       "mcpServers": {
           "iconify": {
               "command": "npm",
               "args": [
                   "start",
                   "--prefix",
                   "/path/to/iconify-mcp"
               ]
           }
       }
   }
   ```

3. Restart Claude Desktop
4. Ask Claude to find icons or generate implementation code

### Example queries

Here are some things you can ask Claude while connected to this server:

- "Find me icons related to home"
- "I need a shopping cart icon for my React app"
- "How do I prevent layout shifts with Iconify icons?"
- "Show me how to customize icon colors in Vue"
- "Generate unplugin-icons configuration for Vite with Vue 3"
- "How do I create custom icon collections with unplugin-icons?"

## Using unplugin-icons

[unplugin-icons](https://github.com/unplugin/unplugin-icons) is a powerful plugin that provides icon components for various build tools and frameworks. This MCP server offers enhanced support for unplugin-icons:

### Key features

- 🔌 **Universal support** - Works with Vite, Webpack, Rollup, and esbuild
- 🧩 **Auto-imports** - Use icons without manual imports
- 🎨 **Customization** - Modify icons via query parameters or global options
- 📦 **Custom collections** - Create and use your own icon sets

### Getting unplugin-icons configuration

Ask Claude queries like:
- "Generate unplugin-icons config for Vite and React"
- "How do I set up unplugin-icons with custom collections?"
- "Show me how to customize icon sizes in unplugin-icons"

## Development

```bash
# Run in development mode with auto-reload
npm run dev
```

## License

MIT

## Acknowledgements

This project is built with:
- [Iconify API](https://iconify.design/)
- [unplugin-icons](https://github.com/unplugin/unplugin-icons)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 
