<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  args: Record<string, unknown>
  result: string | null
}>()

const formattedArgs = computed(() => JSON.stringify(props.args))
</script>

<template>
  <div class="agent-chat__tool">
    <div class="agent-chat__tool-call">
      🔧 <span class="agent-chat__tool-name">{{ name }}</span>
      <span class="agent-chat__tool-args">({{ formattedArgs }})</span>
    </div>
    <div v-if="result" class="agent-chat__tool-result">
      ✅ {{ result }}
    </div>
  </div>
</template>
