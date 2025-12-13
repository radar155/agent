import { ref, type Ref } from 'vue'
import type { DisplayMessage, SSEEvent, ToolCallEvent, ToolResultEvent } from '@/types'
import { parseSSEStream } from './useSSE'

export interface UseChatOptions {
  apiUrl: string
  messages: Ref<DisplayMessage[]>
  onThreadId?: (threadId: string) => void
  onToolCall?: (event: ToolCallEvent) => void
  onToolResult?: (event: ToolResultEvent) => void
}

/**
 * Gestisce l'invio di messaggi e lo streaming delle risposte
 */
export function useChat(options: UseChatOptions) {
  const { apiUrl, messages, onThreadId, onToolCall, onToolResult } = options

  const isLoading = ref(false)
  const currentThreadId = ref<string | null>(null)

  async function sendMessage(text: string): Promise<void> {
    const trimmed = text.trim()
    if (!trimmed || isLoading.value) return

    messages.value.push({ type: 'user', content: trimmed })
    isLoading.value = true

    let currentAssistantIndex: number | null = null

    try {
      const res = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          threadId: currentThreadId.value
        })
      })

      await parseSSEStream(res, (event: SSEEvent) => {
        handleSSEEvent(event, {
          onThreadId: (threadId) => {
            const isNew = !currentThreadId.value
            currentThreadId.value = threadId
            if (isNew) onThreadId?.(threadId)
          },
          onToken: (content) => {
            if (currentAssistantIndex === null) {
              messages.value.push({ type: 'assistant', content: '' })
              currentAssistantIndex = messages.value.length - 1
            }
            const msg = messages.value[currentAssistantIndex]
            if (msg.type === 'assistant') {
              msg.content += content
            }
          },
          onToolCall: (id, name, args) => {
            currentAssistantIndex = null
            messages.value.push({ type: 'tool', id, name, args, result: null })
            onToolCall?.({ id, name, args })
          },
          onToolResult: (id, name, content) => {
            const toolMsg = messages.value.find(
              (m): m is DisplayMessage & { type: 'tool' } => m.type === 'tool' && m.id === id
            )
            if (toolMsg) {
              toolMsg.result = content
            }
            onToolResult?.({ id, name, content })
          },
          onError: (message) => {
            messages.value.push({ type: 'assistant', content: `❌ Errore: ${message}` })
          }
        })
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto'
      messages.value.push({ type: 'assistant', content: `❌ Errore di connessione: ${errorMessage}` })
    } finally {
      isLoading.value = false
    }
  }

  function setThreadId(threadId: string | null): void {
    currentThreadId.value = threadId
  }

  return {
    isLoading,
    currentThreadId,
    sendMessage,
    setThreadId
  }
}

interface SSEHandlers {
  onThreadId: (threadId: string) => void
  onToken: (content: string) => void
  onToolCall: (id: string, name: string, args: Record<string, unknown>) => void
  onToolResult: (id: string, name: string, content: string) => void
  onError: (message: string) => void
}

function handleSSEEvent(event: SSEEvent, handlers: SSEHandlers): void {
  switch (event.type) {
    case 'thread_id':
      handlers.onThreadId(event.threadId)
      break
    case 'token':
      handlers.onToken(event.content)
      break
    case 'tool_call':
      handlers.onToolCall(event.id, event.name, event.args)
      break
    case 'tool_result':
      handlers.onToolResult(event.id, event.name, event.content)
      break
    case 'error':
      handlers.onError(event.message)
      break
  }
}
