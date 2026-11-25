import Teek from 'vitepress-theme-teek'
import 'vitepress-theme-teek/theme-chalk/index.css'
import './custom.css'

export default {
  extends: Teek,
  enhanceApp() {
    if (typeof window === 'undefined') return
    const { pathname, search, hash } = window.location
    // VitePress uses the article pathname to produce the SSR class name.
    const canonicalPath = pathname.replace(/%2b/gi, '+')
    if (canonicalPath !== pathname) {
      window.history.replaceState(window.history.state, '', canonicalPath + search + hash)
    }
  },
}
