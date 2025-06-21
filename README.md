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

## Available Tools

The Iconify MCP server provides the following tools:

- `get-collection`: Retrieves a list of all available icon sets on Iconify.
  - *Parameters*: None
  - *Example output*:
    ```json
    {
      "material-symbols": {
        "name": "Material Symbols",
        "total": 14217,
        "author": { "name": "Google" },
        "license": { "title": "Apache 2.0", "spdx": "Apache-2.0" },
        "samples": ["downloading", "privacy-tip", ...],
        "height": 24,
        "category": "Material"
      },
      ...
    }
    ```

- `search-icons`: Searches for icons matching your query and returns integration snippets for various frameworks (React, Vue, Svelte, etc.).
  - *Parameters*:
    - `query` (string, required): The search term for icons
    - `limit` (integer, optional, default: 10): Maximum number of results to return (1-100)
    - `framework` (string, optional): Framework for code snippets ("raw-svg", "unplugin-icons", "iconify-icon-webcomponent", "react", "vue", "svelte", "lit", "ember")
    - `setId` (string, optional): Icon set ID to search within
  - *Example*:
    ```json
    {
      "query": "home",
      "limit": 5,
      "framework": "react"
    }
    ```
  - *Example output*: Returns matching icons with code snippets for the specified framework

- `get-icon-snippet`: Generates implementation code for a specific icon in your chosen framework.
  - *Parameters*:
    - `iconSet` (string, required): The icon set ID (e.g., "mdi", "lucide")
    - `iconName` (string, required): The name of the icon within the set
    - `framework` (string, required): The target framework ("raw-svg", "unplugin-icons", "iconify-icon-webcomponent", "react", "vue", "svelte", "lit", "ember")
  - *Example*:
    ```json
    {
      "iconSet": "mdi",
      "iconName": "home",
      "framework": "react"
    }
    ```
  - *Example output*:
    ```jsx
    // Assuming you use @iconify/react
    // import { Icon } from '@iconify/react';
    // <Icon icon="mdi:home" />
    ```

## Available Resources

The server also provides access to the following resources:

- **Icon set details**: Access detailed information about any icon set using URI templates like `iconify://collection/{setId}`
  - *Example*: `iconify://collection/material-symbols`

- **Individual icons**: Retrieve SVG files for individual icons with URIs like `iconify://icon/{setId}/{iconName}.svg`
  - *Example*: `iconify://icon/mdi/home.svg`

- **List of available icon sets**: Get a comprehensive list at `iconify://collections`

- **Usage guidance**: Access usage instructions and best practices at `iconify://usage-guide`

> TIP: Use the `get-collection` tool to explore available icon sets, then search for specific icons with `search-icons`, or get integration code with `get-icon-snippet`.

## Getting Started

### Usage with Claude Desktop

1. Configure Claude Desktop to use the server:

   Open your Claude Desktop configuration file:

   **macOS/Linux**: `~/Library/Application Support/Claude/claude_desktop_config.json`   \
   **Windows**: `%AppData%\Claude\claude_desktop_config.json`

   Add this server to your configuration:

   ```json
   {
     "mcpServers": {
       "iconify": {
         "command": "npx",
         "args": ["-y", "iconify-mcp@latest"]
       }
     }
   }
   ```

2. Restart Claude Desktop
3. Ask Claude to find icons or generate implementation code

### Example queries

Here are some things you can ask Claude while connected to this server:

- "Find me icons related to home"
- "I need a shopping cart icon for my React app"
- "How do I prevent layout shifts with Iconify icons?"
- "Show me how to customize icon colors in Vue"
- "Generate unplugin-icons configuration for Vite with Vue 3"
- "How do I create custom icon collections with unplugin-icons?"

## License

MIT

## Acknowledgements

This project is built with:

- [Iconify API](https://iconify.design/)
- [unplugin-icons](https://github.com/unplugin/unplugin-icons)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
