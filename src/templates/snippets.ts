import { toPascalCase } from "@/lib/utils.js"

export const unpluginIconsSnippetTemplate = (iconName: string, iconSet: string) => `
import Icon${toPascalCase(iconName)} from 'virtual:icons/${iconSet}/${iconName}'
// Usage: <Icon${toPascalCase(iconName)} />

// Method 2: Using the unified syntax (recommended)
import Icon${toPascalCase(iconName)} from '~icons/${iconSet}/${iconName}'
// Usage: <Icon${toPascalCase(iconName)} />

// Custom size example
import CustomSizeIcon from '~icons/${iconSet}/${iconName}?width=2em&height=2em'
// Usage: <CustomSizeIcon />

## Customization Options

When using unplugin-icons, customization depends on the components it generates:

\`\`\`jsx
// Using class names:
<IconMdiHome className="text-red-500 text-2xl" />

// In most frameworks:
<IconMdiHome style={{ color: 'red', fontSize: '24px' }} />

// For Vue with custom props support:
<IconMdiHome color="red" width="24" height="24" />
\`\`\`

Consult unplugin-icons documentation for framework-specific customization options.
`

export const iconifyIconWebcomponentSnippetTemplate = (iconName: string, iconSet: string) => `
<iconify-icon icon="${iconSet}:${iconName}"></iconify-icon>

## Customization Options

The web component accepts various attributes for customization:

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
- style: CSS properties like color, font-size
`

export const reactSnippetTemplate = (iconName: string, iconSet: string) => `
// Assuming you use @iconify/react
// import { Icon } from '@iconify/react';
// <Icon icon="${iconSet}:${iconName}" />

## Customization Options

The Iconify component for React accepts these common properties:

\`\`\`jsx
<Icon
  icon="mdi:home"
  color="red"
  width="24"
  height="24"
  flip="horizontal"
  rotate={1}
  inline={true}
/>
\`\`\`

Common properties:
- width, height: Size in pixels
- color: Icon color (CSS value)
- flip: "horizontal", "vertical", or "both"
- rotate: Rotation in 90° increments (1-3) or in degrees as string
- inline: boolean, shift icon to make it work with text
`

export const vueSnippetTemplate = (iconName: string, iconSet: string) => `
// Assuming you use @iconify/vue
// import { Icon } from '@iconify/vue';
// <Icon icon="${iconSet}:${iconName}" />

## Customization Options

The Iconify component for Vue accepts these common properties:

\`\`\`html
<Icon
  icon="mdi:home"
  color="red"
  width="24"
  height="24"
  flip="horizontal"
  rotate="90deg"
  :inline="true"
/>
\`\`\`

Common properties:
- width, height: Size in pixels
- color: Icon color (CSS value)
- flip: "horizontal", "vertical", or "both"
- rotate: Rotation in degrees as string
- inline: boolean, shift icon to make it work with text
`

export const svelteSnippetTemplate = (iconName: string, iconSet: string) => `
<!-- Assuming you use @iconify/svelte -->
<script>
  import Icon from '@iconify/svelte';
</script>

<Icon icon="${iconSet}:${iconName}" />

## Customization Options

The Iconify component for Svelte accepts these common properties:

\`\`\`svelte
<Icon
  icon="mdi:home"
  color="red"
  width="24"
  height="24"
  flip="horizontal"
  rotate={1}
  inline={true}
/>
\`\`\`

Common properties:
- width, height: Size in pixels
- color: Icon color (CSS value)
- flip: "horizontal", "vertical", or "both"
- rotate: Rotation in 90° increments (1-3) or in degrees as string
- inline: boolean, shift icon to make it work with text
`

export const litSnippetTemplate = (iconName: string, iconSet: string) => `
// Assuming you use @iconify/lit
// import { Icon } from '@iconify/lit';
// // Usage in render(): html\`<Icon icon="${iconSet}:${iconName}" />\`

## Customization Options

The Iconify component for Lit accepts these common properties:

\`\`\`js
// In your render() method:
return html\`
  <Icon
    .icon=\"mdi:home\"
    .color=\"red\"
    .width=\"24\"
    .height=\"24\"
    .flip=\"horizontal\"
    .rotate=\"90deg\"
    .inline=\"true\"
  />
\`;
\`\`\`

Common properties:
- width, height: Size in pixels
- color: Icon color (CSS value)
- flip: "horizontal", "vertical", or "both"
- rotate: Rotation in degrees as string
- inline: boolean, shift icon to make it work with text
`

export const emberSnippetTemplate = (iconName: string, iconSet: string) => `
{{! Assuming you use @iconify/ember }}
<Icon @icon="${iconSet}:${iconName}" />

## Customization Options

The Iconify component for Ember accepts these common properties:

\`\`\`handlebars
<Icon 
  @icon="mdi:home"
  @color="red"
  @width="24"
  @height="24"
  @flip="horizontal"
  @rotate="90deg"
  @inline={{true}}
/>
\`\`\`

Common properties:
- width, height: Size in pixels
- color: Icon color (CSS value)
- flip: "horizontal", "vertical", or "both"
- rotate: Rotation in degrees as string
- inline: boolean, shift icon to make it work with text
`
