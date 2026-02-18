<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import WoodenFish from './components/WoodenFish.vue'
import QuoteBubble from './components/QuoteBubble.vue'
import MeritBubble from './components/MeritBubble.vue'
import { pickRandomQuote } from './data/quotes.js'
import { getOpenReplyStream } from './api/open.js'
import bgmUrl from './assets/bgm.mp3'

const { t, locale, tm } = useI18n({ useScope: 'global' })
const quoteList = computed(() => {
  // 依赖 locale 以在切换语言时更新短句池
  void locale.value
  return tm('quotes') || []
})

const currentQuote = ref('')
const bgmPlaying = ref(false)
const meritBubbles = ref([])
const maxMeritBubbles = 5
let nextMeritId = 0
let bgm = null
let bgmPending = true

// 求大师开示
const showOpenModal = ref(false)
const openQuestion = ref('')
const openReply = ref('')
const openLoading = ref(false)
const openError = ref('')
const openModalRef = ref(null)
const openEntryRef = ref(null)

const openReplyHtml = computed(() => {
  if (!openReply.value) return ''
  try {
    return marked(openReply.value, { async: false })
  } catch {
    return openReply.value
  }
})

onMounted(() => {
  bgm = new Audio(bgmUrl)
  bgm.loop = true
  bgm.volume = 0.5
  bgm.play().then(() => {
    bgmPlaying.value = true
    bgmPending = false
  }).catch(() => {
    bgmPending = true
  })
})

function toggleBgm() {
  if (!bgm) return
  if (bgmPlaying.value) {
    bgm.pause()
    bgm.currentTime = 0
    bgmPlaying.value = false
  } else {
    bgm.play().then(() => {
      bgmPlaying.value = true
      bgmPending = false
    }).catch(() => { })
  }
}

function onTap() {
  if (bgmPending && bgm && !bgmPlaying.value) {
    bgm.play().then(() => {
      bgmPlaying.value = true
      bgmPending = false
    }).catch(() => { })
  }
  currentQuote.value = pickRandomQuote(quoteList.value, currentQuote.value)
  const list = meritBubbles.value
  if (list.length >= maxMeritBubbles) {
    list.shift()
  }
  const left = Math.random() < 0.5
    ? 10 + Math.random() * 28
    : 62 + Math.random() * 28
  const top = 52 + Math.random() * 18
  list.push({ id: nextMeritId++, left, top })
}

function removeMeritBubble(id) {
  meritBubbles.value = meritBubbles.value.filter((b) => b.id !== id)
}

function openOpenModal() {
  showOpenModal.value = true
  openQuestion.value = ''
  openReply.value = ''
  openError.value = ''
}

function closeOpenModal() {
  showOpenModal.value = false
  openQuestion.value = ''
  openReply.value = ''
  openError.value = ''
}

function onOpenModalBackdrop(e) {
  if (e.target === openModalRef.value) closeOpenModal()
}

function setLocale(newLocale) {
  locale.value = newLocale
  try {
    localStorage.setItem('app-locale', newLocale)
  } catch (_) {}
}

async function submitOpen() {
  openError.value = ''
  openReply.value = ''
  openLoading.value = true
  try {
    await getOpenReplyStream(openQuestion.value, (chunk) => {
      openReply.value += chunk
    }, locale.value)
  } catch (err) {
    const msg = err?.message || ''
    openError.value = msg.startsWith('errors.') ? t(msg) : (msg || t('errors.requestFailed'))
  } finally {
    openLoading.value = false
  }
}
</script>

<template>
  <div class="app">
    <div class="merit-bubbles" aria-hidden="true">
      <MeritBubble v-for="b in meritBubbles" :key="b.id" :id="b.id" :left="b.left" :top="b.top"
        @done="removeMeritBubble" />
    </div>
    <div class="top-actions">
      <button type="button" class="lang-switcher" :aria-label="locale === 'zh-CN' ? t('lang.switchToEn') : t('lang.switchToZh')" @click="setLocale(locale === 'zh-CN' ? 'en' : 'zh-CN')">
        {{ t('lang.otherLangName') }}
      </button>
      <button type="button" class="bgm-toggle" :aria-label="bgmPlaying ? t('common.bgmAriaOff') : t('common.bgmAriaOn')" @click="toggleBgm">
        {{ bgmPlaying ? t('common.bgmOff') : t('common.bgmOn') }}
      </button>
    </div>
    <header class="header">
      <h1 class="title">{{ t('header.title') }}</h1>
      <p class="subtitle">{{ t('header.subtitle') }}</p>
    </header>

    <div class="main-wrap">
      <main class="main">
        <QuoteBubble :quote="currentQuote" />
        <WoodenFish @tap="onTap" />
        <button
          type="button"
          ref="openEntryRef"
          class="open-entry"
          :aria-expanded="showOpenModal"
          aria-haspopup="dialog"
          :aria-label="t('open.entry')"
          @click="openOpenModal"
        >
          {{ t('open.entry') }}
        </button>
      </main>
    </div>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showOpenModal"
          ref="openModalRef"
          class="open-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="open-modal-title"
          @click="onOpenModalBackdrop"
        >
          <div class="open-modal-card" @click.stop>
            <h2 id="open-modal-title" class="open-modal-title">{{ t('open.modalTitle') }}</h2>
            <textarea
              v-model="openQuestion"
              class="open-modal-input"
              :placeholder="t('open.placeholder')"
              rows="3"
              :disabled="openLoading"
            />
            <button
              type="button"
              class="open-modal-submit"
              :disabled="openLoading"
              @click="submitOpen"
            >
              {{ openLoading ? t('open.submitting') : t('open.submit') }}
            </button>
            <div v-if="openError" class="open-modal-error">{{ openError }}</div>
            <div v-if="openReply && !openError" class="open-modal-reply-wrap">
              <p class="open-modal-reply-label">{{ t('open.replyLabel') }}</p>
              <div class="open-modal-reply open-modal-reply-scroll">
                <div class="open-modal-reply-text markdown-body" v-html="openReplyHtml" />
              </div>
            </div>
            <button type="button" class="open-modal-close" @click="closeOpenModal">
              {{ t('open.close') }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <footer class="footer">
      <p>{{ t('footer.slogan') }}</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.title {
  margin: 0 0 0.35rem;
  font-size: 1.85rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.25;
}

.subtitle {
  margin: 0;
  font-size: 0.975rem;
  opacity: 0.82;
  letter-spacing: 0.02em;
}

.main-wrap {
  position: relative;
  flex: 1;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.25rem;
}

.merit-bubbles {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  overflow: visible;
  z-index: 2;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 1;
}

.main :deep(.quote-bubble) {
  order: 1;
}

.main :deep(.wooden-fish) {
  order: 2;
}

.open-entry {
  order: 3;
  margin-top: 1.25rem;
  padding: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.65);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 0.2em;
  transition: color 0.2s;
}

.open-entry:hover {
  color: rgba(255, 255, 255, 0.9);
}

.open-entry:focus {
  outline: none;
}

.open-entry:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.footer {
  margin-top: auto;
  padding-top: 1.75rem;
  text-align: center;
  font-size: 0.8125rem;
  opacity: 0.65;
  letter-spacing: 0.02em;
}

.footer p {
  margin: 0;
}

.top-actions {
  position: fixed;
  top: 0.875rem;
  right: 0.875rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lang-switcher,
.bgm-toggle {
  box-sizing: border-box;
  height: 2.25rem;
  min-width: 3.5rem;
  padding: 0 0.85rem;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.88);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  transition: color 0.2s, background 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.lang-switcher:hover,
.bgm-toggle:hover {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.22);
}

.lang-switcher:focus,
.bgm-toggle:focus {
  outline: none;
}

.lang-switcher:focus-visible,
.bgm-toggle:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 0;
}

.lang-switcher:active,
.bgm-toggle:active {
  transform: none;
}

@media (prefers-color-scheme: light) {
  .lang-switcher,
  .bgm-toggle {
    color: #1a1a1a;
    background: rgba(0, 0, 0, 0.06);
    border-color: rgba(0, 0, 0, 0.1);
  }

  .lang-switcher:hover,
  .bgm-toggle:hover {
    color: #1a1a1a;
    background: rgba(0, 0, 0, 0.1);
    border-color: rgba(0, 0, 0, 0.16);
  }

  .lang-switcher:focus-visible,
  .bgm-toggle:focus-visible {
    outline-color: rgba(0, 0, 0, 0.35);
    outline-offset: 0;
  }

  .open-entry {
    color: rgba(0, 0, 0, 0.6);
  }

  .open-entry:hover {
    color: #1a1a1a;
  }

  .open-entry:focus-visible {
    outline-color: rgba(0, 0, 0, 0.35);
  }
}

/* 求大师开示弹层（不受 scoped 限制的 Teleport 目标需用 :deep 或全局；此处弹层在 body 下，用全局类） */
.open-modal-backdrop {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.open-modal-card {
  width: 100%;
  max-width: min(560px, 92vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1.5rem 1.35rem;
  background: rgba(28, 28, 28, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.open-modal-title {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.95);
}

.open-modal-input {
  width: 100%;
  margin-bottom: 0.85rem;
  padding: 0.75rem 0.9rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  resize: vertical;
  box-sizing: border-box;
}

.open-modal-input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.open-modal-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.open-modal-input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.open-modal-submit {
  width: 100%;
  margin-bottom: 0.75rem;
  padding: 0.6rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.open-modal-submit:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.35);
}

.open-modal-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.open-modal-submit:focus {
  outline: none;
}

.open-modal-submit:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.open-modal-error {
  margin-bottom: 0.75rem;
  font-size: 0.8125rem;
  color: rgba(255, 120, 80, 0.95);
}

.open-modal-reply-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  overflow: hidden;
}

.open-modal-reply-label {
  margin: 0 0 0.35rem;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  flex-shrink: 0;
}

.open-modal-reply {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.open-modal-reply-text {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.95);
}

.open-modal-reply-text.markdown-body :deep(p) {
  margin: 0 0 0.75em;
}
.open-modal-reply-text.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}
.open-modal-reply-text.markdown-body :deep(strong) {
  font-weight: 600;
}
.open-modal-reply-text.markdown-body :deep(h1),
.open-modal-reply-text.markdown-body :deep(h2),
.open-modal-reply-text.markdown-body :deep(h3) {
  margin: 1em 0 0.4em;
  font-weight: 600;
  line-height: 1.3;
}
.open-modal-reply-text.markdown-body :deep(ul),
.open-modal-reply-text.markdown-body :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}
.open-modal-reply-text.markdown-body :deep(li) {
  margin: 0.25em 0;
}
.open-modal-reply-text.markdown-body :deep(blockquote) {
  margin: 0.75em 0;
  padding-left: 1em;
  border-left: 3px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.85);
}
.open-modal-reply-text.markdown-body :deep(code) {
  padding: 0.15em 0.4em;
  font-size: 0.9em;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
}
.open-modal-reply-text.markdown-body :deep(pre) {
  margin: 0.75em 0;
  padding: 1rem;
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}
.open-modal-reply-text.markdown-body :deep(pre code) {
  padding: 0;
  background: none;
}

.open-modal-close {
  flex-shrink: 0;
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.65);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.open-modal-close:hover {
  color: rgba(255, 255, 255, 0.9);
}

.open-modal-close:focus {
  outline: none;
}

.open-modal-close:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .open-modal-card,
.modal-fade-leave-active .open-modal-card {
  transition: transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .open-modal-card,
.modal-fade-leave-to .open-modal-card {
  transform: scale(0.96);
}

@media (prefers-color-scheme: light) {
  .open-modal-card {
    background: rgba(255, 255, 255, 0.98);
    border-color: rgba(0, 0, 0, 0.08);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }

  .open-modal-title {
    color: #1a1a1a;
  }

  .open-modal-input {
    color: #1a1a1a;
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.12);
  }

  .open-modal-input::placeholder {
    color: rgba(0, 0, 0, 0.45);
  }

  .open-modal-input:focus {
    border-color: rgba(0, 0, 0, 0.25);
  }

  .open-modal-submit {
    color: #1a1a1a;
    background: rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.12);
  }

  .open-modal-submit:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.12);
    border-color: rgba(0, 0, 0, 0.2);
  }

  .open-modal-submit:focus-visible {
    outline-color: rgba(0, 0, 0, 0.35);
  }

  .open-modal-error {
    color: #c0392b;
  }

  .open-modal-reply {
    background: rgba(0, 0, 0, 0.04);
    border-color: rgba(0, 0, 0, 0.08);
  }

  .open-modal-reply-label {
    color: rgba(0, 0, 0, 0.55);
  }

  .open-modal-reply-text {
    color: #1a1a1a;
  }

  .open-modal-reply-text.markdown-body :deep(blockquote) {
    border-left-color: rgba(0, 0, 0, 0.2);
    color: rgba(0, 0, 0, 0.8);
  }

  .open-modal-reply-text.markdown-body :deep(code) {
    background: rgba(0, 0, 0, 0.08);
  }

  .open-modal-reply-text.markdown-body :deep(pre) {
    background: rgba(0, 0, 0, 0.06);
  }

  .open-modal-close {
    color: rgba(0, 0, 0, 0.6);
  }

  .open-modal-close:hover {
    color: #1a1a1a;
  }

  .open-modal-close:focus-visible {
    outline-color: rgba(0, 0, 0, 0.35);
  }
}
</style>
