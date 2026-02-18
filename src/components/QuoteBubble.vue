<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  quote: { type: String, default: '' },
})

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <div class="quote-bubble">
    <Transition name="bubble-fade" mode="out-in">
      <div v-if="quote" key="has-quote" class="bubble-content">
        <p class="quote-text">{{ quote }}</p>
      </div>
      <p v-else key="no-quote" class="quote-placeholder">{{ t('quote.placeholder') }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.quote-bubble {
  max-width: 90vw;
  min-height: 4em;
  padding: 1.15rem 1.35rem;
  margin: 0 auto 1.25rem;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.04) inset;
}

.bubble-content {
  display: block;
}

.quote-text {
  margin: 0;
  font-size: 1.08rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.01em;
}

.quote-placeholder {
  margin: 0;
  font-size: 0.975rem;
  color: rgba(255, 255, 255, 0.52);
  letter-spacing: 0.01em;
}

.bubble-fade-enter-active,
.bubble-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.bubble-fade-enter-from,
.bubble-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-color-scheme: light) {
  .quote-bubble {
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(0, 0, 0, 0.06);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04) inset;
  }
  .quote-text {
    color: #1a1a1a;
  }
  .quote-placeholder {
    color: rgba(0, 0, 0, 0.52);
  }
}
</style>
