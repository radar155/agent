<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type: 'user' | 'assistant'
  content: string
}>()

const renderedContent = computed(() => {
  if (props.type === 'assistant' && typeof window !== 'undefined' && (window as any).marked) {
    return (window as any).marked.parse(props.content || '')
  }
  return props.content
})

const isMarkdown = computed(() => props.type === 'assistant')
</script>

<template>
  <div
    class="agent-chat__message"
    :class="`agent-chat__message--${type}`"
  >
    <div v-if="isMarkdown" v-html="renderedContent" />
    <template v-else>{{ content }}</template>
  </div>
</template>
