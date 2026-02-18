<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  id: { type: [Number, String], required: true },
  left: { type: Number, required: true },
  top: { type: Number, default: 58 },
})

const emit = defineEmits(['done'])

const isRising = ref(false)
const showDurationMs = 400
let timeoutId = null

onMounted(() => {
  timeoutId = setTimeout(() => {
    isRising.value = true
  }, showDurationMs)
})

onBeforeUnmount(() => {
  if (timeoutId) clearTimeout(timeoutId)
})

function onRiseEnd(e) {
  if (e.animationName === 'merit-rise') {
    emit('done', props.id)
  }
}

const bubbleStyle = {
  left: props.left + '%',
  top: props.top + '%',
}
</script>

<template>
  <div
    class="merit-bubble"
    :class="{ 'merit-bubble--rise': isRising }"
    :style="bubbleStyle"
    role="status"
    aria-live="polite"
    @animationend="onRiseEnd"
  >
    功德+1
  </div>
</template>

<style scoped>
.merit-bubble {
  position: absolute;
  transform: translateX(-50%) translateY(0);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #702f00;
  white-space: nowrap;
  pointer-events: none;
  opacity: 1;
}

.merit-bubble--rise {
  animation: merit-rise 1s ease-out forwards;
}

@keyframes merit-rise {
  from {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
    color: #702f00;
  }
  to {
    transform: translateX(-50%) translateY(-100px);
    opacity: 0;
    color: rgba(112, 47, 0, 0);
  }
}
</style>
