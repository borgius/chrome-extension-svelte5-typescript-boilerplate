// uno.config.ts
import { defineConfig, Preset, PresetOrFactory, Rule } from 'unocss'
import { presetUno } from 'unocss'
import presetIcons from '@unocss/preset-icons'

type Theme = {}

export default defineConfig<Theme>({
  presets: [
    presetUno(),
    presetIcons({
      cdn: 'https://esm.sh/'
    }) as PresetOrFactory<Theme>,
  ],
  // ...UnoCSS options
})