<script setup lang="ts">
defineProps<{
  threads: string[]
  activeThreadId: string | null
}>()

const emit = defineEmits<{
  select: [threadId: string]
  new: []
}>()
</script>

<template>
  <div class="agent-chat__sidebar">
    <div class="agent-chat__sidebar-header">
      <button class="agent-chat__new-btn" @click="emit('new')">
        + Nuova conversazione
      </button>
    </div>
    <div class="agent-chat__thread-list">
      <div
        v-for="thread in threads"
        :key="thread"
        class="agent-chat__thread-item"
        :class="{ 'agent-chat__thread-item--active': thread === activeThreadId }"
        :title="thread"
        @click="emit('select', thread)"
      >
        {{ thread }}
      </div>
    </div>
  </div>
</template>
