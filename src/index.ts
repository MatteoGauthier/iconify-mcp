// index.ts
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js" // Or StreamableHTTPServerTransport for HTTP
import { z } from "zod"

const ICONIFY_API_BASE = "https://api.iconify.design"
const USER_AGENT = "MCP-Iconify-Server/1.0.0" // Good practice to set a User-Agent

// --- Helper Functions ---
function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w)/g, (text) => text.replace(/-/, "").toUpperCase())
}

/**
 * Retrieves SVG data for an icon and returns a code snippet for the specified framework.
 */
async function getIconSnippet(
  iconSet: string,
  iconName: string,
  framework: z.infer<typeof FrameworkEnum>
): Promise<string> {
  const svgResponse = await fetch(`${ICONIFY_API_BASE}/${iconSet}/${iconName}.svg`, {
    headers: { "User-Agent": USER_AGENT },
  })
  if (!svgResponse.ok) {
    const errorText = await svgResponse.text()
    throw new Error(
      `Failed to fetch SVG for ${iconSet}:${iconName} - ${svgResponse.status} ${svgResponse.statusText}. Body: ${errorText}`
    )
  }
  const svg = await svgResponse.text()

  switch (framework) {
    case "raw-svg":
      return svg
    case "unplugin-icons":
      // Enhanced unplugin-icons snippet with both import styles
      return `// Method 1: Using virtual imports
import Icon${toPascalCase(iconName)} from 'virtual:icons/${iconSet}/${iconName}'
// Usage: <Icon${toPascalCase(iconName)} />

// Method 2: Using the unified syntax (recommended)
import Icon${toPascalCase(iconName)} from '~icons/${iconSet}/${iconName}'
// Usage: <Icon${toPascalCase(iconName)} />

// Custom size example
import CustomSizeIcon from '~icons/${iconSet}/${iconName}?width=2em&height=2em'
// Usage: <CustomSizeIcon />`
    case "iconify-icon-webcomponent":
      return `<iconify-icon icon="${iconSet}:${iconName}"></iconify-icon>`
    case "react":
      return `// Assuming you use @iconify/react\nimport { Icon } from '@iconify/react';\n<Icon icon="${iconSet}:${iconName}" />`
    case "vue":
      return `// Assuming you use @iconify/vue\nimport { Icon } from '@iconify/vue';\n<Icon icon="${iconSet}:${iconName}" />`
    case "svelte":
      return `<!-- Assuming you use @iconify/svelte -->\n<script>\n  import Icon from '@iconify/svelte';\n</script>\n\n<Icon icon="${iconSet}:${iconName}" />`
    case "lit":
      return `// Assuming you use @iconify/lit\nimport { Icon } from '@iconify/lit';\n// Usage in render(): html\`<Icon icon="${iconSet}:${iconName}" />\``
    case "ember":
      return `{{! Assuming you use @iconify/ember }}\n<Icon @icon="${iconSet}:${iconName}" />`
    default:
      return "Snippet generation for this framework is not yet supported."
  }
}

/**
 * Returns setup guidance for using Iconify with different frameworks.
 */
function getSetupGuidance(framework: z.infer<typeof FrameworkEnum>): string {
  switch (framework) {
    case "raw-svg":
      return "No specific setup needed. Just embed the SVG."
    case "unplugin-icons":
      return `## Setup for unplugin-icons

1. Install the package:
\`\`\`bash
npm install -D unplugin-icons
\`\`\`

2. Configure in your build tool:

### For Vite:
\`\`\`js
// vite.config.js
import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

export default {
  plugins: [
    Icons({
      compiler: 'vue3', // or 'vue2', 'jsx', 'solid'
      // Optional: Custom collections
      customCollections: {
        // key as the collection name
        'my-icons': {
          account: '<svg><!-- ... --></svg>',
          // other icons
        },
        // Load from filesystem
        'my-fs-icons': FileSystemIconLoader('./assets/icons'),
      },
      // Optional: Customize icon properties
      iconCustomizer(collection, icon, props) {
        // Customize specific icons or entire collections
        if (collection === 'mdi' && icon === 'account') {
          props.width = '2em'
          props.height = '2em'
        }
      }
    }),
  ],
}
\`\`\`

### For Webpack:
\`\`\`js
// webpack.config.js
const Icons = require('unplugin-icons/webpack')

module.exports = {
  plugins: [
    Icons({
      compiler: 'jsx', // For React
      // other options
    }),
  ],
}
\`\`\`

3. Use with auto-imports (recommended):

For Vue:
\`\`\`js
// vite.config.js
import Components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default {
  plugins: [
    Components({
      resolvers: [
        IconsResolver(),
      ],
    }),
  ],
}
\`\`\`

Then use icons in components without importing:
\`\`\`vue
<template>
  <i-mdi-account />
</template>
\`\`\`

For React/Solid:
\`\`\`js
// vite.config.js
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default {
  plugins: [
    AutoImport({
      resolvers: [
        IconsResolver({
          prefix: 'Icon',
          extension: 'jsx',
        }),
      ],
    }),
  ],
}
\`\`\`

For more details, see: https://github.com/unplugin/unplugin-icons`
    case "iconify-icon-webcomponent":
      return "Include the IconifyIcon web component script:\n```html\n<script src=\"https://cdn.jsdelivr.net/npm/iconify-icon@1.0.0/dist/iconify-icon.min.js\"></script>\n```\nSee: https://iconify.design/docs/icon-components/iconify-icon/"
    case "react":
      return "Install '@iconify/react':\n```bash\nnpm install @iconify/react\n```\nImport and use the Icon component. See: https://iconify.design/docs/icon-components/react/"
    case "vue":
      return "Install '@iconify/vue':\n```bash\nnpm install @iconify/vue\n```\nImport and use the Icon component. See: https://iconify.design/docs/icon-components/vue/"
    case "svelte":
      return "Install '@iconify/svelte':\n```bash\nnpm install @iconify/svelte\n```\nImport and use the Icon component. See: https://iconify.design/docs/icon-components/svelte/"
    case "lit":
      return "Install '@iconify/lit':\n```bash\nnpm install @iconify/lit\n```\nImport and use the Icon component. See: https://iconify.design/docs/icon-components/lit/"
    case "ember":
      return "Install '@iconify/ember':\n```bash\nnpm install @iconify/ember\n```\nUse the Icon component in your templates. See: https://iconify.design/docs/icon-components/ember/"
    default:
      return "Setup guidance for this framework is not yet available."
  }
}

/**
 * Returns CSS to prevent layout shift with Iconify icons.
 */
function getLayoutShiftPrevention(framework: z.infer<typeof FrameworkEnum>): string {
  if (framework === "iconify-icon-webcomponent") {
    return `/* Add this CSS to prevent layout shifts with iconify-icon web component */
iconify-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
}`;
  } else if (framework === "raw-svg") {
    return "/* No specific layout shift prevention needed for raw SVG */";
  } else {
    return `/* Add this CSS to ensure consistent icon sizing */
.iconify {
  display: inline-block;
  width: 1em;
  height: 1em;
}`;
  }
}

// --- MCP Server Initialization ---
const server = new McpServer({
  name: "IconifyIntegration",
  version: "1.0.0",
})

// --- Resource Definitions ---

// List all icon sets (collections)
server.resource("icon-sets", "iconify://collections", async (uri) => {
  try {
    const response = await fetch(`${ICONIFY_API_BASE}/collections`, { headers: { "User-Agent": USER_AGENT } })
    if (!response.ok) throw new Error(`Iconify API error (${response.status}): ${response.statusText}`)
    const collections = (await response.json()) as Record<string, { name: string }> // Type assertion
    const collectionInfo = Object.entries(collections)
      .map(([id, details]) => `- ${id} (${details.name})`)
      .join("\n")

    return {
      contents: [
        {
          uri: uri.href,
          text: `Available Icon Sets:\n${collectionInfo}`,
        },
      ],
    }
  } catch (error: any) {
    console.error("Error in icon-sets resource:", error)
    return { contents: [{ uri: uri.href, text: `Error fetching icon sets: ${error.message}` }] }
  }
})

// Get details for a specific icon set
server.resource(
  "icon-set-details",
  new ResourceTemplate("iconify://collection/{setId}", { list: undefined }),
  async (uri, { setId }) => {
    try {
      const response = await fetch(`${ICONIFY_API_BASE}/collection?prefix=${setId}`, {
        headers: { "User-Agent": USER_AGENT },
      })
      if (!response.ok)
        throw new Error(`Iconify API error (${response.status}) for set ${setId}: ${response.statusText}`)
      const data = await response.json()
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      }
    } catch (error: any) {
      console.error(`Error in icon-set-details resource for ${setId}:`, error)
      return { contents: [{ uri: uri.href, text: `Error fetching set ${setId}: ${error.message}` }] }
    }
  }
)

// Get SVG for a specific icon
server.resource(
  "icon-svg",
  new ResourceTemplate("iconify://icon/{setId}/{iconName}.svg", { list: undefined }),
  async (uri, { setId, iconName }) => {
    try {
      const response = await fetch(`${ICONIFY_API_BASE}/${setId}/${iconName}.svg`, {
        headers: { "User-Agent": USER_AGENT },
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Iconify API error (${response.status}) for SVG ${setId}:${iconName}: ${response.statusText}. Body: ${errorText}`
        )
      }
      const svg = await response.text()
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "image/svg+xml",
            text: svg,
          },
        ],
      }
    } catch (error: any) {
      console.error(`Error in icon-svg resource for ${setId}:${iconName}:`, error)
      return { contents: [{ uri: uri.href, text: `Error fetching SVG for ${setId}:${iconName}: ${error.message}` }] }
    }
  }
)

// Documentation resource for usage guidance
server.resource("usage-guidance", "iconify://usage-guide", async (uri) => {
  const frameworkDetails = FrameworkEnum.options.map(framework => {
    const setup = getSetupGuidance(framework as z.infer<typeof FrameworkEnum>);
    const layoutCss = getLayoutShiftPrevention(framework as z.infer<typeof FrameworkEnum>);
    let frameworkName = framework.charAt(0).toUpperCase() + framework.slice(1);
    if (framework === "raw-svg") frameworkName = "Raw SVG";
    if (framework === "unplugin-icons") frameworkName = "unplugin-icons";
    if (framework === "iconify-icon-webcomponent") frameworkName = "IconifyIcon Web Component";

    let docLink = "";
    switch (framework) {
      case "unplugin-icons":
        docLink = "https://github.com/unplugin/unplugin-icons";
        break;
      case "iconify-icon-webcomponent":
        docLink = "https://iconify.design/docs/icon-components/iconify-icon/";
        break;
      case "react":
        docLink = "https://iconify.design/docs/icon-components/react/";
        break;
      case "vue":
        docLink = "https://iconify.design/docs/icon-components/vue/";
        break;
      case "svelte":
        docLink = "https://iconify.design/docs/icon-components/svelte/";
        break;
      case "lit":
        docLink = "https://iconify.design/docs/icon-components/lit/";
        break;
      case "ember":
        docLink = "https://iconify.design/docs/icon-components/ember/";
        break;
      default:
        // No specific doc link for raw-svg
        break;
    }

    return `## ${frameworkName}

### Setup
${setup}

### Preventing Layout Shifts
\`\`\`css
${layoutCss}
\`\`\`
${docLink ? `\nFor more details, see: ${docLink}` : ""}
`;
  }).join("\\n");

  return {
    contents: [
      {
        uri: uri.href,
        text: `# Iconify Usage Guide

## About Iconify
Iconify is a unified icon framework that provides access to over 200,000 icons from more than 150 open-source icon sets.

## Advantages of Iconify
- Icons load on demand - only icons you use are loaded
- Consistent API across different icon sets
- All icons are optimized SVG
- Easy switching between different icon sets
- No need to install multiple icon fonts

## Getting Started
1. Search for icons using the \`search-icons\` tool.
2. Get implementation snippets for your framework using the \`get-icon-snippet\` tool.
3. Follow the setup instructions below for your chosen implementation method.

---
${frameworkDetails}
---

For more general information, visit https://iconify.design/docs/
`,
      },
    ],
  };
})

// --- Tool Definitions ---

const FrameworkEnum = z.enum([
  "raw-svg",
  "unplugin-icons",
  "iconify-icon-webcomponent",
  "react",
  "vue",
  "svelte",
  "lit",
  "ember",
])

server.tool(
  "search-icons",
  "Searches for icons on Iconify and returns a list of matching icons. Can optionally provide integration snippets.",
  {
    query: z.string().describe("The search term for icons (e.g., 'home', 'user')."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .default(10)
      .describe("Maximum number of results to return (1-100)."),
    framework: FrameworkEnum.optional().describe("If provided, returns code snippets for this framework."),
    setId: z.string().optional().describe("Optional: Icon set ID (prefix) to search within (e.g., 'mdi', 'lucide')."),
  },
  async ({ query, limit, framework, setId }) => {
    try {
      let searchUrl = `${ICONIFY_API_BASE}/search?query=${encodeURIComponent(query)}&limit=${limit}`
      if (setId) {
        searchUrl += `&prefix=${encodeURIComponent(setId)}`
      }
      const response = await fetch(searchUrl, { headers: { "User-Agent": USER_AGENT } })
      if (!response.ok) throw new Error(`Iconify API search error (${response.status}): ${response.statusText}`)

      // Define a more specific type for Iconify search results
      interface IconifySearchResult {
        icons: string[]
        total: number
        limit: number
        start: number
        collections: Record<string, { name: string }>
        // Iconify API sometimes uses 'aliases' or 'prefixes' depending on context
        // For /search, it seems to return full names in 'icons' if prefix isn't specified,
        // or prefixed names if prefix is specified. Let's adapt.
        prefixes?: Record<string, string> // Used if names are like prefix:icon
      }
      const searchResults = (await response.json()) as IconifySearchResult

      if (!searchResults.icons || searchResults.icons.length === 0) {
        return { content: [{ type: "text", text: "No icons found for your query." }] }
      }

      let outputText = `Found ${searchResults.icons.length} of ${searchResults.total} matching icons:\n`

      for (const iconFullName of searchResults.icons) {
        // Iconify search directly returns full names like "mdi:home"
        outputText += `- ${iconFullName}\n`

        if (framework) {
          const parts = iconFullName.split(":")
          if (parts.length === 2) {
            const currentIconSet = parts[0]
            const currentIconName = parts[1]
            try {
              const snippet = await getIconSnippet(currentIconSet, currentIconName, framework)
              outputText += `  Snippet (${framework}): ${snippet}\n`
            } catch (snippetError: any) {
              outputText += `  Error generating snippet for ${iconFullName}: ${snippetError.message}\n`
            }
          } else {
            outputText += `  Could not parse icon set/name from ${iconFullName} for snippet generation.\n`
          }
        }
      }

      if (framework) {
        outputText += `\nSetup Guidance for ${framework}:\n${getSetupGuidance(framework)}\n`
        outputText += `\nCSS for Layout Shift Prevention:\n${getLayoutShiftPrevention(framework)}\n`
      }

      // Add a note about API caching
      outputText += `\nNote: Iconify API caches icon data in the browser for performance. Subsequent uses of the same icons will be faster.\n`
      
      return { content: [{ type: "text", text: outputText }] }
    } catch (error: any) {
      console.error("Error in search-icons tool:", error)
      return { content: [{ type: "text", text: `Error searching icons: ${error.message}` }], isError: true }
    }
  }
)

server.tool(
  "get-icon-snippet",
  "Retrieves an integration snippet for a specific icon and framework.",
  {
    iconSet: z.string().describe("The icon set ID (prefix) (e.g., 'mdi', 'lucide')."),
    iconName: z.string().describe("The name of the icon within the set (e.g., 'home', 'account')."),
    framework: FrameworkEnum.describe("The target framework for the snippet."),
  },
  async ({ iconSet, iconName, framework }) => {
    try {
      const snippet = await getIconSnippet(iconSet, iconName, framework)
      const setup = getSetupGuidance(framework)
      const layoutCSS = getLayoutShiftPrevention(framework)
      
      return {
        content: [
          { 
            type: "text", 
            text: `Snippet for ${iconSet}:${iconName} (${framework}):\n${snippet}\n\nSetup:\n${setup}\n\nLayout Shift Prevention:\n${layoutCSS}`
          },
        ],
      }
    } catch (error: any) {
      console.error("Error in get-icon-snippet tool:", error)
      return { content: [{ type: "text", text: `Error getting snippet: ${error.message}` }], isError: true }
    }
  }
)

// New tool for customization options
server.tool(
  "icon-customization-guide",
  "Provides guidance on how to customize icons in different frameworks",
  {
    framework: FrameworkEnum.describe("The framework you want customization guidance for."),
  },
  async ({ framework }) => {
    try {
      let guidanceText = `# Icon Customization Guide for ${framework}\n\n`;
      
      switch (framework) {
        case "raw-svg":
          guidanceText += `When using raw SVG, you can customize by directly modifying SVG attributes like width, height, fill, stroke, etc.\n
Example:
\`\`\`html
<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <!-- icon contents -->
</svg>
\`\`\``;
          break;
        
        case "iconify-icon-webcomponent":
          guidanceText += `The web component accepts various attributes for customization:\n
\`\`\`html
<iconify-icon
  icon="mdi:home"
  style="color: red; font-size: 24px;"
  width="24"
  height="24"
  flip="horizontal"
  rotate="90deg"
></iconify-icon>
\`\`\`

Available attributes:
- width, height: Size in pixels
- flip: horizontal, vertical, or both
- rotate: Rotation in degrees
- style: CSS properties like color, font-size`;
          break;
        
        case "react":
        case "vue":
        case "svelte":
        case "lit":
        case "ember":
          guidanceText += `The Iconify component for ${framework} accepts these common properties:\n
\`\`\`${framework === "vue" ? "html" : "jsx"}
<Icon
  icon="${framework === "vue" ? "mdi:home" : "mdi:home"}"
  color="red"
  width="24"
  height="24"
  flip="horizontal"
  rotate={1}
  ${framework === "vue" ? ":inline=\"true\"" : "inline={true}"}
/>
\`\`\`

Common properties:
- width, height: Size in pixels
- color: Icon color (CSS value)
- flip: "horizontal", "vertical", or "both"
- rotate: Rotation in 90° increments (1-3) or in degrees as string
- inline: boolean, shift icon to make it work with text`;
          break;
        
        case "unplugin-icons":
          guidanceText += `When using unplugin-icons, customization depends on the components it generates:\n
\`\`\`jsx
// In most frameworks:
<IconMdiHome style={{ color: 'red', fontSize: '24px' }} />

// For Vue with custom props support:
<IconMdiHome color="red" width="24" height="24" />
\`\`\`

Consult unplugin-icons documentation for framework-specific customization options.`;
          break;
        
        default:
          guidanceText += "Customization guidance not available for this framework.";
      }
      
      return {
        content: [{ type: "text", text: guidanceText }],
      }
    } catch (error: any) {
      console.error("Error in icon-customization-guide tool:", error)
      return {
        content: [{ type: "text", text: `Error retrieving customization guide: ${error.message}` }],
        isError: true
      }
    }
  }
)

// Add a new function for unplugin-icons customization options
function getUnpluginIconsCustomizationOptions(): string {
  return `# Customization Options for unplugin-icons

## Query Parameters
You can customize individual icons using query parameters:

\`\`\`js
// Different sizes for the same icon
import MdiAlarmNormal from '~icons/mdi/alarm'
import MdiAlarmLarge from '~icons/mdi/alarm?width=4em&height=4em'
import MdiAlarmSmall from '~icons/mdi/alarm?width=1em&height=1em'
\`\`\`

## Global Customization
You can customize icons globally in your configuration:

\`\`\`js
Icons({
  scale: 1.2, // Scale of icons against 1em
  defaultStyle: '', // Style applied to all icons
  defaultClass: '', // Class names applied to all icons
})
\`\`\`

## Icon Customizer
For more fine-grained control, use the iconCustomizer function:

\`\`\`js
Icons({
  iconCustomizer(collection, icon, props) {
    // Customize all icons in a collection
    if (collection === 'mdi') {
      props.width = '1.5em'
      props.height = '1.5em'
    }
    
    // Customize specific icons
    if (collection === 'mdi' && icon === 'account') {
      props.width = '2em'
      props.height = '2em'
    }
  }
})
\`\`\`

## SVG Transformation
You can transform the SVG content directly:

\`\`\`js
Icons({
  transform(svg, collection, icon) {
    // Add fill="currentColor" to specific icons
    if (collection === 'my-icons' && icon === 'logo') {
      return svg.replace(/^<svg /, '<svg fill="currentColor" ')
    }
    return svg
  }
})
\`\`\`

## Custom Collections
You can define custom collections in your config:

\`\`\`js
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

Icons({
  customCollections: {
    // Inline SVG definitions
    'my-icons': {
      account: '<svg><!-- ... --></svg>',
      settings: () => fs.readFile('./path/to/settings.svg', 'utf-8'),
    },
    
    // Load from filesystem
    'fs-icons': FileSystemIconLoader(
      './assets/icons',
      svg => svg.replace(/^<svg /, '<svg fill="currentColor" ')
    ),
    
    // Custom loader with async function
    'remote-icons': async (iconName) => {
      return await fetch(\`https://example.com/icons/\${iconName}.svg\`).then(res => res.text())
    }
  }
})
\`\`\`
`
}

// Add a new tool for unplugin-icons specific configuration
server.tool(
  "unplugin-icons-config",
  "Generates unplugin-icons configuration for different build tools and frameworks",
  {
    buildTool: z.enum(["vite", "webpack", "rollup", "esbuild"]).describe("The build tool you're using"),
    framework: z.enum(["vue2", "vue3", "react", "solid", "svelte"]).describe("The framework you're using"),
    customCollections: z.boolean().optional().default(false).describe("Include custom collections configuration"),
    autoImport: z.boolean().optional().default(true).describe("Include auto-import configuration"),
  },
  async ({ buildTool, framework, customCollections, autoImport }) => {
    try {
      let configCode = `// unplugin-icons configuration for ${buildTool} with ${framework}\n\n`
      
      // Import statements based on build tool
      if (buildTool === "vite") {
        configCode += `// vite.config.js\nimport Icons from 'unplugin-icons/vite'\n`
        
        if (autoImport) {
          if (framework === "vue2" || framework === "vue3") {
            configCode += `import Components from 'unplugin-vue-components/vite'\n`
            configCode += `import IconsResolver from 'unplugin-icons/resolver'\n`
          } else if (framework === "react" || framework === "solid") {
            configCode += `import AutoImport from 'unplugin-auto-import/vite'\n`
            configCode += `import IconsResolver from 'unplugin-icons/resolver'\n`
          }
        }
        
        if (customCollections) {
          configCode += `import { FileSystemIconLoader } from 'unplugin-icons/loaders'\n`
          configCode += `import { promises as fs } from 'node:fs'\n`
        }
      } else if (buildTool === "webpack") {
        configCode += `// webpack.config.js\nconst Icons = require('unplugin-icons/webpack')\n`
        
        if (autoImport) {
          if (framework === "vue2" || framework === "vue3") {
            configCode += `const Components = require('unplugin-vue-components/webpack')\n`
            configCode += `const IconsResolver = require('unplugin-icons/resolver')\n`
          } else if (framework === "react" || framework === "solid") {
            configCode += `const AutoImport = require('unplugin-auto-import/webpack')\n`
            configCode += `const IconsResolver = require('unplugin-icons/resolver')\n`
          }
        }
        
        if (customCollections) {
          configCode += `const { FileSystemIconLoader } = require('unplugin-icons/loaders')\n`
          configCode += `const fs = require('fs').promises\n`
        }
      } else if (buildTool === "rollup") {
        configCode += `// rollup.config.js\nimport Icons from 'unplugin-icons/rollup'\n`
        
        if (autoImport) {
          if (framework === "vue2" || framework === "vue3") {
            configCode += `import Components from 'unplugin-vue-components/rollup'\n`
            configCode += `import IconsResolver from 'unplugin-icons/resolver'\n`
          } else if (framework === "react" || framework === "solid") {
            configCode += `import AutoImport from 'unplugin-auto-import/rollup'\n`
            configCode += `import IconsResolver from 'unplugin-icons/resolver'\n`
          }
        }
        
        if (customCollections) {
          configCode += `import { FileSystemIconLoader } from 'unplugin-icons/loaders'\n`
          configCode += `import { promises as fs } from 'node:fs'\n`
        }
      } else if (buildTool === "esbuild") {
        configCode += `// esbuild.config.js\nimport { build } from 'esbuild'\nimport Icons from 'unplugin-icons/esbuild'\n`
        
        if (autoImport) {
          configCode += `// Note: Auto-import with esbuild may require additional setup\n`
        }
        
        if (customCollections) {
          configCode += `import { FileSystemIconLoader } from 'unplugin-icons/loaders'\n`
          configCode += `import { promises as fs } from 'node:fs'\n`
        }
      }
      
      // Configuration object
      if (buildTool === "vite" || buildTool === "rollup") {
        configCode += `\nexport default {\n  plugins: [\n`
      } else if (buildTool === "webpack") {
        configCode += `\nmodule.exports = {\n  plugins: [\n`
      } else if (buildTool === "esbuild") {
        configCode += `\nbuild({\n  plugins: [\n`
      }
      
      // Icons configuration
      configCode += `    Icons({\n`
      configCode += `      compiler: '${framework === "vue2" ? "vue2" : framework === "vue3" ? "vue3" : framework}',\n`
      configCode += `      scale: 1.2, // Scale of icons against 1em\n`
      
      if (customCollections) {
        configCode += `      customCollections: {\n`
        configCode += `        // key as the collection name\n`
        configCode += `        'my-icons': {\n`
        configCode += `          account: '<svg><!-- Your SVG content here --></svg>',\n`
        configCode += `          // Load your custom icon lazily\n`
        configCode += `          settings: () => fs.readFile('./path/to/settings.svg', 'utf-8'),\n`
        configCode += `        },\n`
        configCode += `        // Load from filesystem\n`
        configCode += `        'my-fs-icons': FileSystemIconLoader(\n`
        configCode += `          './assets/icons',\n`
        configCode += `          svg => svg.replace(/^<svg /, '<svg fill="currentColor" ')\n`
        configCode += `        ),\n`
        configCode += `      },\n`
        
        configCode += `      // Optional icon customizer\n`
        configCode += `      iconCustomizer(collection, icon, props) {\n`
        configCode += `        // Example: customize all icons in the 'mdi' collection\n`
        configCode += `        if (collection === 'mdi') {\n`
        configCode += `          props.width = '1.5em'\n`
        configCode += `          props.height = '1.5em'\n`
        configCode += `        }\n`
        configCode += `      },\n`
      }
      
      configCode += `    }),\n`
      
      // Auto import configuration
      if (autoImport) {
        if (framework === "vue2" || framework === "vue3") {
          configCode += `    Components({\n`
          configCode += `      resolvers: [\n`
          configCode += `        IconsResolver({\n`
          configCode += `          prefix: 'i', // Use <i-mdi-home /> or customize with your preferred prefix\n`
          configCode += `        }),\n`
          configCode += `      ],\n`
          configCode += `    }),\n`
        } else if (framework === "react" || framework === "solid") {
          configCode += `    AutoImport({\n`
          configCode += `      resolvers: [\n`
          configCode += `        IconsResolver({\n`
          configCode += `          prefix: 'Icon', // Use <IconMdiHome /> in your JSX\n`
          configCode += `          extension: 'jsx',\n`
          configCode += `        }),\n`
          configCode += `      ],\n`
          configCode += `    }),\n`
        }
      }
      
      if (buildTool === "vite" || buildTool === "rollup" || buildTool === "webpack") {
        configCode += `  ],\n};\n`
      } else if (buildTool === "esbuild") {
        configCode += `  ],\n  // other esbuild options\n});\n`
      }
      
      // Usage examples
      configCode += `\n// Usage Examples:\n\n`
      
      if (framework === "vue2" || framework === "vue3") {
        if (autoImport) {
          configCode += `/* 
With auto-import, use icons directly in your template:

<template>
  <i-mdi-home />
  <i-mdi-account style="color: red; font-size: 24px;" />
</template>
*/\n`
        } else {
          configCode += `/* 
Without auto-import, import icons manually:

<script setup>
import MdiHome from '~icons/mdi/home'
import MdiAccount from '~icons/mdi/account?width=24px&height=24px'
</script>

<template>
  <MdiHome />
  <MdiAccount style="color: red;" />
</template>
*/\n`
        }
      } else if (framework === "react" || framework === "solid") {
        if (autoImport) {
          configCode += `/* 
With auto-import, use icons directly in your component:

function MyComponent() {
  return (
    <div>
      <IconMdiHome />
      <IconMdiAccount style={{ color: 'red', fontSize: '24px' }} />
    </div>
  )
}
*/\n`
        } else {
          configCode += `/* 
Without auto-import, import icons manually:

import MdiHome from '~icons/mdi/home'
import MdiAccount from '~icons/mdi/account'

function MyComponent() {
  return (
    <div>
      <MdiHome />
      <MdiAccount style={{ color: 'red', fontSize: '24px' }} />
    </div>
  )
}
*/\n`
        }
      } else if (framework === "svelte") {
        configCode += `/* 
Svelte usage:

<script>
  import MdiHome from '~icons/mdi/home'
  import MdiAccount from '~icons/mdi/account'
</script>

<div>
  <MdiHome />
  <MdiAccount style="color: red; font-size: 24px;" />
</div>
*/\n`
      }
      
      return { 
        content: [
          { 
            type: "text", 
            text: configCode 
          }
        ]
      }
    } catch (error: any) {
      console.error("Error in unplugin-icons-config tool:", error)
      return { 
        content: [
          { 
            type: "text", 
            text: `Error generating unplugin-icons configuration: ${error.message}` 
          }
        ], 
        isError: true 
      }
    }
  }
)

// --- Main Function to Start Server ---
async function main() {
  // Using StdioServerTransport for local testing.
  // For a web server, you'd use StreamableHTTPServerTransport with Express or similar.
  const transport = new StdioServerTransport()
  try {
    await server.connect(transport)
    console.error("Iconify Integration MCP Server running on stdio.")
    console.error("Ready to receive MCP messages.")
  } catch (error) {
    console.error("Failed to start MCP server:", error)
    process.exit(1)
  }
}

// Execute the main function
main().catch((error) => {
  console.error("Unhandled error in main execution:", error)
  process.exit(1)
})
