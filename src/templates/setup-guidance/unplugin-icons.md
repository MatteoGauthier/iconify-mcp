### Setup for unplugin-icons

1. Install the package:
```bash
npm install -D unplugin-icons
```

2. Configure in your build tool:

#### For Vite:
```js
// vite.config.js
import Icles from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

export default {
  plugins: [
    Icons({
      compiler: 'vue3', // or 'vue2', 'jsx', 'solid'
      customCollections: {
        'my-icons': {
          account: '<svg><!-- ... --></svg>',
        },
        'my-fs-icons': FileSystemIconLoader('./assets/icons'),
      },
      iconCustomizer(collection, icon, props) {
        if (collection === 'mdi' && icon === 'account') {
          props.width = '2em'
          props.height = '2em'
        }
      }
    }),
  ],
}
```

#### For Webpack:
```js
// webpack.config.js
const Icons = require('unplugin-icons/webpack')

module.exports = {
  plugins: [
    Icons({
      compiler: 'jsx', // For React
    }),
  ],
}
```

3. Use with auto-imports (recommended):

For Vue:
```js
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
```

For React/Solid:
```js
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
```

For more details: https://github.com/unplugin/unplugin-icons 
