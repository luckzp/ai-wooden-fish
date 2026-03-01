<script setup>
import { ref, onMounted } from 'vue'
import fishSvg from '../assets/WoodenFish.svg'

const emit = defineEmits(['tap'])

const cooldownMs = 400
let lastTapAt = 0
const isTapping = ref(false)
let tapSound = null

onMounted(() => {
  tapSound = new Audio('/tap.mp3')
  tapSound.volume = 1
  tapSound.preload = 'auto'
})

function onTap() {
  const now = Date.now()
  if (now - lastTapAt < cooldownMs) return
  lastTapAt = now

  isTapping.value = true
  if (tapSound) {
    tapSound.currentTime = 0
    tapSound.play().catch(() => { })
  }
  emit('tap')
  setTimeout(() => {
    isTapping.value = false
  }, 200)
}
</script>

<template>
  <button type="button" class="wooden-fish" :class="{ tap: isTapping }" aria-label="敲木鱼" @click="onTap">
    <div class="fish-mallet-wrap">
      <img :src="fishSvg" class="fish-svg" alt="" aria-hidden="true" />
      <div class="mallet-wrap" aria-hidden="true">
        <svg class="mallet-svg" viewBox="0 0 24 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 槌柄 -->
          <rect x="9" y="28" width="6" height="52" rx="2" fill="#702f00" stroke="#4a2000" stroke-width="1" />
          <!-- 槌头 -->
          <ellipse cx="12" cy="22" rx="10" ry="12" fill="#702f00" stroke="#4a2000" stroke-width="1" />
        </svg>
      </div>
    </div>
  </button>
</template>

<style scoped>
.wooden-fish {
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.wooden-fish:focus {
  outline: none;
}

.wooden-fish:focus-visible {
  outline: 2px solid var(--color-accent, #c9a227);
  outline-offset: 2px;
}

.fish-mallet-wrap {
  position: relative;
  display: inline-block;
}

.fish-svg {
  width: 160px;
  height: auto;
  max-width: 40vw;
  display: block;
  filter: drop-shadow(2px 5px 10px rgba(0, 0, 0, 0.28));
  transition: transform 0.12s ease-out;
}

.wooden-fish:hover .fish-svg {
  transform: scale(1.03);
}

.wooden-fish.tap .fish-svg {
  transform: scale(0.92);
}

/* 木槌：置于木鱼右上方不重叠，默认倾斜；槌柄底为旋转中心，敲击时向左下摆动 */
.mallet-wrap {
  position: absolute;
  top: -15%;
  right: -42%;
  width: 48px;
  height: 100px;
  max-height: 28vw;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transform-origin: center bottom;
  transform: rotate(-24deg);
  transition: transform 0.12s ease-out;
  filter: drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.25));
}

.mallet-svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom center;
}

.wooden-fish.tap .mallet-wrap {
  transform: rotate(-38deg);
}
</style>
