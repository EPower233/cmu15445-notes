import { defineConfig } from 'vitepress'
import sidebar from './book-sidebar.json'
import settings from './book-settings.json'
import { common, readingTheme } from './site-shared.mts'

export default defineConfig({
  ...common,
  lang: settings.lang,
  themeConfig: {
    ...common.themeConfig,
    ...readingTheme(sidebar, settings.lang.startsWith('zh')),
  },
})
