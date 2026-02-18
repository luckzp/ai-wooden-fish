<script setup>
import { ref, onMounted } from 'vue'
import WoodenFish from './components/WoodenFish.vue'
import QuoteBubble from './components/QuoteBubble.vue'
import MeritBubble from './components/MeritBubble.vue'
import { pickRandomQuote } from './data/quotes.js'
import bgmUrl from './assets/bgm.mp3'

const currentQuote = ref('')
const bgmPlaying = ref(false)
const meritBubbles = ref([])
const maxMeritBubbles = 5
let nextMeritId = 0
let bgm = null
let bgmPending = true

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
  currentQuote.value = pickRandomQuote(currentQuote.value)
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
</script>

<template>
  <div class="app">
    <div class="merit-bubbles" aria-hidden="true">
      <MeritBubble v-for="b in meritBubbles" :key="b.id" :id="b.id" :left="b.left" :top="b.top"
        @done="removeMeritBubble" />
    </div>
    <button type="button" class="bgm-toggle" :aria-label="bgmPlaying ? '关闭背景音乐' : '开启背景音乐'" @click="toggleBgm">
      {{ bgmPlaying ? '关闭 BGM' : '开启 BGM' }}
    </button>
    <header class="header">
      <h1 class="title">敲木鱼 · AI 大师</h1>
      <p class="subtitle">敲一下，烦恼少一点</p>
    </header>

    <div class="main-wrap">
      <main class="main">
        <QuoteBubble :quote="currentQuote" />
        <WoodenFish @tap="onTap" />
      </main>
    </div>

    <footer class="footer">
      <p>应无所住而生其心</p>
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

.bgm-toggle {
  position: fixed;
  top: 0.875rem;
  right: 0.875rem;
  z-index: 10;
  padding: 0.5rem 0.85rem;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.88);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  transition: color 0.2s, background 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.bgm-toggle:hover {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.22);
}

.bgm-toggle:focus {
  outline: none;
}

.bgm-toggle:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

@media (prefers-color-scheme: light) {
  .bgm-toggle {
    color: #1a1a1a;
    background: rgba(0, 0, 0, 0.06);
    border-color: rgba(0, 0, 0, 0.1);
  }

  .bgm-toggle:hover {
    color: #1a1a1a;
    background: rgba(0, 0, 0, 0.1);
    border-color: rgba(0, 0, 0, 0.16);
  }

  .bgm-toggle:focus-visible {
    outline-color: rgba(0, 0, 0, 0.35);
  }
}
</style>
