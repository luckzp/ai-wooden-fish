import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import './style.css'
import App from './App.vue'
import zhCN from './locales/zh-CN.js'
import en from './locales/en.js'

function getInitialLocale() {
  try {
    const saved = localStorage.getItem('app-locale')
    if (saved === 'en' || saved === 'zh-CN') return saved
  } catch (_) {}
  const lang = typeof navigator !== 'undefined' ? navigator.language : ''
  if (lang && (lang.startsWith('zh') || lang.startsWith('zh-CN'))) return 'zh-CN'
  return 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN.messages,
    en: en.messages,
  },
})

createApp(App).use(i18n).mount('#app')
