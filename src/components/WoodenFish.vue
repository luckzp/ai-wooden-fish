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
    tapSound.play().catch(() => {})
  }
  emit('tap')
  setTimeout(() => {
    isTapping.value = false
  }, 200)
}
</script>

<template>
  <button
    type="button"
    class="wooden-fish"
    :class="{ tap: isTapping }"
    aria-label="敲木鱼"
    @click="onTap"
  >
    <img
      :src="fishSvg"
      class="fish-svg"
      alt=""
      aria-hidden="true"
    />
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
</style>
