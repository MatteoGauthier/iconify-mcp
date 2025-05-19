import { z } from "zod"

export const FrameworkEnum = z.enum([
  "raw-svg",
  "unplugin-icons",
  "iconify-icon-webcomponent",
  "react",
  "vue",
  "svelte",
  "lit",
  "ember",
])
