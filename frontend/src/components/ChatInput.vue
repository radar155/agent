<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  disabled: boolean
}>()

const emit = defineEmits<{
  send: [message: string]
}>()

const inputText = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function handleSend() {
  const text = inputText.value.trim()
  if (!text) return
  emit('send', text)
  inputText.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div class="agent-chat__input-area">
    <input
      ref="inputRef"
      v-model="inputText"
      type="text"
      class="agent-chat__input"
      placeholder="Scrivi un messaggio..."
      :disabled="disabled"
      @keydown="handleKeydown"
    >
    <button
      class="agent-chat__send-btn"
      :disabled="disabled"
      @click="handleSend"
    >
      Invia
    </button>
  </div>
</template>
