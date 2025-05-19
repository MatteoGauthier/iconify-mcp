// index.ts
import { ICONIFY_API_BASE, USER_AGENT } from "@/lib/constants.js"
import { FrameworkEnum } from "@/lib/schemas.js"
import {
  emberSnippetTemplate,
  iconifyIconWebcomponentSnippetTemplate,
  litSnippetTemplate,
  reactSnippetTemplate,
  svelteSnippetTemplate,
  unpluginIconsSnippetTemplate,
  vueSnippetTemplate,
} from "@/templates/snippets.js"
import { promises as fs } from "fs"
import path from "path"
import { z } from "zod"
export function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w)/g, (text) => text.replace(/-/, "").toUpperCase())
}

export async function getIconSnippet(
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
      return unpluginIconsSnippetTemplate(iconName, iconSet)
    case "iconify-icon-webcomponent":
      return iconifyIconWebcomponentSnippetTemplate(iconName, iconSet)
    case "react":
      return reactSnippetTemplate(iconName, iconSet)
    case "vue":
      return vueSnippetTemplate(iconName, iconSet)
    case "svelte":
      return svelteSnippetTemplate(iconName, iconSet)
    case "lit":
      return litSnippetTemplate(iconName, iconSet)
    case "ember":
      return emberSnippetTemplate(iconName, iconSet)
    default:
      return "Snippet generation for this framework is not yet supported."
  }
}

export async function getSetupGuidance(framework: z.infer<typeof FrameworkEnum>): Promise<string> {
  try {
    const filePath = path.join(__dirname, `../templates/setup-guidance/${framework}.md`)
    return await fs.readFile(filePath, "utf-8")
  } catch (error) {
    console.error("Error reading setup guidance:", error)
    return "Setup guidance for this framework is not yet available."
  }
}
