// Components
export { default as AgentChat } from './components/AgentChat.vue'

// Types
export type {
  AgentChatConfig,
  ChatMessage,
  ToolMessage,
  DisplayMessage,
  ToolCallEvent,
  ToolResultEvent,
  AgentChatExpose
} from './types'

// Composables (for advanced usage)
export { useChat } from './composables/useChat'
export { useThreads } from './composables/useThreads'
export { parseSSEStream } from './composables/useSSE'
