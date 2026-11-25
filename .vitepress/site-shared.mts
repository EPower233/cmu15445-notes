import { fileURLToPath } from 'node:url'
import type { DefaultTheme, UserConfig } from 'vitepress'
import footnote from 'markdown-it-footnote'
import htmlTableInline from './html-table-inline.mts'
import readableTables from './readable-tables.mts'
import alertTitleInline from './alert-title-inline.mts'
import headingLinks from './heading-links.mts'
import settings from './book-settings.json'

const base = process.env.PAGES_BASE_PATH || '/'
const root = fileURLToPath(new URL('..', import.meta.url))

export const common: UserConfig = {
  base,
  outDir: process.env.BOOK_OUT_DIR,
  title: settings.title,
  markdown: {
    math: true,
    lineNumbers: true,
    config(md) {
      md.use(footnote)
      md.use(htmlTableInline)
      md.use(readableTables)
      md.use(alertTitleInline)
      if (settings.readerTitleLinks) md.use(headingLinks, root)
      // Prevent Vue SFC interpolation errors on inline code containing `{{` or `}}` (e.g. Verilog `{4{a}}`, Go/Jinja templates).
      const origCodeInline = md.renderer.rules.code_inline
      md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
        if (tokens[idx].content.includes('{{') || tokens[idx].content.includes('}}')) {
          tokens[idx].attrSet('v-pre', '')
        }
        return origCodeInline
          ? origCodeInline(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options)
      }
    },
  },
  postRender({ teleports }) {
    if (teleports?.['#tk-popover-container']) {
      // Teek's hidden panels use client z-index and visibility state.
      teleports.body = (teleports.body ?? '') + '<div id="tk-popover-container" data-allow-mismatch="children"></div>'
    }
  },
  vite: {
    ssr: { noExternal: ['vitepress-theme-teek'] },
    build: { assetsInlineLimit: 0, rollupOptions: { treeshake: false } },
  },
  themeConfig: {
    teekHome: false,
    // Keep Teek's top-right ThemeEnhance reading panel (layout, max-width, color palette, spotlight) enabled.
    themeEnhance: { enabled: true },
    codeBlock: { enabled: true, collapseHeight: 700 },
    anchorScroll: false,
    i18nRouting: false,
    socialLinks: settings.github ? [{ icon: 'github', link: settings.github }] : [],
    search: {
      provider: 'local',
      options: {
        _render(source, env, md) {
          const html = md.render(source, env)
          if (env.frontmatter?.search === false) return ''
          return html.replace(/<mjx-container\b[\s\S]*?<\/mjx-container>/g, ' ')
            .replace(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/g, heading =>
              heading.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g, (link, attrs, label) =>
                /\bclass="header-anchor"/.test(attrs) ? link : label,
              ),
            )
        },
      },
    },
  },
}

export function readingTheme(sidebar: DefaultTheme.Sidebar, zh: boolean) {
  return {
    sidebar,
    outline: { level: [2, 3] as [number, number], label: zh ? '页面导航' : 'On this page' },
    docFooter: zh ? { prev: '上一页', next: '下一页' } : { prev: 'Previous page', next: 'Next page' },
  }
}
