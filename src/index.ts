// index.ts
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { ICONIFY_API_BASE, USER_AGENT } from "./lib/constants.js"
import { FrameworkEnum } from "./lib/schemas.js"
import { getIconSnippet, getSetupGuidance } from "./lib/utils.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
const server = new McpServer({
  name: "IconifyIntegration",
  version: "1.0.0",
})

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

server.resource("usage-guidance", "iconify://usage-guide", async (uri) => {
  const frameworkDetails = FrameworkEnum.options
    .map((framework) => {
      const setup = getSetupGuidance(framework as z.infer<typeof FrameworkEnum>)
      let frameworkName = framework.charAt(0).toUpperCase() + framework.slice(1)
      if (framework === "raw-svg") frameworkName = "Raw SVG"
      if (framework === "unplugin-icons") frameworkName = "unplugin-icons"
      if (framework === "iconify-icon-webcomponent") frameworkName = "IconifyIcon Web Component"

      let docLink = ""
      switch (framework) {
        case "unplugin-icons":
          docLink = "https://github.com/unplugin/unplugin-icons"
          break
        case "iconify-icon-webcomponent":
          docLink = "https://iconify.design/docs/icon-components/iconify-icon/"
          break
        case "react":
          docLink = "https://iconify.design/docs/icon-components/react/"
          break
        case "vue":
          docLink = "https://iconify.design/docs/icon-components/vue/"
          break
        case "svelte":
          docLink = "https://iconify.design/docs/icon-components/svelte/"
          break
        case "lit":
          docLink = "https://iconify.design/docs/icon-components/lit/"
          break
        case "ember":
          docLink = "https://iconify.design/docs/icon-components/ember/"
          break
        default:
          // No specific doc link for raw-svg
          break
      }

      return `## ${frameworkName}

### Setup
${setup}
${docLink ? `\nFor more details, see: ${docLink}` : ""}
`
    })
    .join("\n")

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
  }
})

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

      return {
        content: [
          {
            type: "text",
            text: `Snippet for ${iconSet}:${iconName} (${framework}):\n${snippet}\n\nSetup:\n${setup}`,
          },
        ],
      }
    } catch (error: any) {
      console.error("Error in get-icon-snippet tool:", error)
      return { content: [{ type: "text", text: `Error getting snippet: ${error.message}` }], isError: true }
    }
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("Iconify MCP Server running on stdio")
}

main().catch((error) => {
  console.error("Fatal error in main():", error)
  process.exit(1)
})
