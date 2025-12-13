<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import type { DisplayMessage, ToolCallEvent, ToolResultEvent, AgentChatExpose } from '@/types'
import { useChat } from '@/composables/useChat'
import { useThreads } from '@/composables/useThreads'
import ThreadSidebar from './ThreadSidebar.vue'
import ChatMessage from './ChatMessage.vue'
import ToolExecution from './ToolExecution.vue'
import ChatInput from './ChatInput.vue'

const props = withDefaults(defineProps<{
  apiUrl: string
  showThreads?: boolean
  threadId?: string
}>(), {
  showThreads: true,
  threadId: undefined
})

const emit = defineEmits<{
  'tool-call': [event: ToolCallEvent]
  'tool-result': [event: ToolResultEvent]
}>()

// State
const messages = ref<DisplayMessage[]>([])
const chatContainer = ref<HTMLElement | null>(null)
const inputRef = ref<InstanceType<typeof ChatInput> | null>(null)

// Composables
const { threads, loadThreads, loadHistory, addThread } = useThreads(props.apiUrl)

const { isLoading, currentThreadId, sendMessage: chatSendMessage, setThreadId } = useChat({
  apiUrl: props.apiUrl,
  messages,
  onThreadId: (threadId) => {
    addThread(threadId)
  },
  onToolCall: (event) => emit('tool-call', event),
  onToolResult: (event) => emit('tool-result', event)
})

// Scroll to bottom
async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

watch(messages, scrollToBottom, { deep: true })

// Thread selection
async function selectThread(threadId: string) {
  if (threadId === currentThreadId.value) return
  
  setThreadId(threadId)
  messages.value = await loadHistory(threadId)
  scrollToBottom()
}

function newConversation() {
  setThreadId(null)
  messages.value = []
}

// Send message (internal + exposed)
async function handleSend(text: string) {
  await chatSendMessage(text)
  await nextTick()
  inputRef.value?.focus()
}

// Exposed method for programmatic sending
async function sendMessage(message: string): Promise<void> {
  await handleSend(message)
}

// Initialize
onMounted(async () => {
  if (props.showThreads) {
    await loadThreads()
  } else if (props.threadId) {
    setThreadId(props.threadId)
    messages.value = await loadHistory(props.threadId)
    scrollToBottom()
  }
})

// Expose public API
defineExpose<AgentChatExpose>({
  sendMessage
})
</script>

<template>
  <div class="agent-chat">
    <ThreadSidebar
      v-if="showThreads"
      :threads="threads"
      :active-thread-id="currentThreadId"
      @select="selectThread"
      @new="newConversation"
    />
    
    <div class="agent-chat__main">
      <div ref="chatContainer" class="agent-chat__messages">
        <div v-if="messages.length === 0" class="agent-chat__empty">
          Inizia una nuova conversazione
        </div>
        
        <template v-for="(msg, index) in messages" :key="index">
          <ToolExecution
            v-if="msg.type === 'tool'"
            :name="msg.name"
            :args="msg.args"
            :result="msg.result"
          />
          <ChatMessage
            v-else
            :type="msg.type"
            :content="msg.content"
          />
        </template>
      </div>
      
      <ChatInput
        ref="inputRef"
        :disabled="isLoading"
        @send="handleSend"
      />
    </div>
  </div>
</template>
