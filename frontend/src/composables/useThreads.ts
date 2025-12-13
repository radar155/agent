import { ref } from 'vue'
import type { DisplayMessage } from '@/types'

/**
 * Gestisce la lista dei thread e il caricamento della history
 */
export function useThreads(apiUrl: string) {
  const threads = ref<string[]>([])
  const isLoadingThreads = ref(false)

  async function loadThreads(): Promise<void> {
    isLoadingThreads.value = true
    try {
      const res = await fetch(`${apiUrl}/threads`)
      const data = await res.json()
      threads.value = data.threads || []
    } catch (err) {
      console.error('Errore caricamento threads:', err)
    } finally {
      isLoadingThreads.value = false
    }
  }

  async function loadHistory(threadId: string): Promise<DisplayMessage[]> {
    const res = await fetch(`${apiUrl}/history/${threadId}`)
    const data = await res.json()
    return parseHistoryToMessages(data.messages || [])
  }

  function addThread(threadId: string): void {
    if (!threads.value.includes(threadId)) {
      threads.value = [threadId, ...threads.value]
    }
  }

  return {
    threads,
    isLoadingThreads,
    loadThreads,
    loadHistory,
    addThread
  }
}

/**
 * Converte i messaggi LangChain in formato DisplayMessage
 */
function parseHistoryToMessages(langchainMessages: any[]): DisplayMessage[] {
  const messages: DisplayMessage[] = []
  const pendingToolCalls = new Map<string, DisplayMessage>()

  for (const msg of langchainMessages) {
    const msgType = msg.id?.[2]
    const kwargs = msg.kwargs || {}

    if (msgType === 'HumanMessage') {
      messages.push({ type: 'user', content: kwargs.content || '' })
    } else if (msgType === 'AIMessageChunk' || msgType === 'AIMessage') {
      const toolCalls = kwargs.tool_calls || []
      for (const tc of toolCalls) {
        const toolMsg: DisplayMessage = {
          type: 'tool',
          id: tc.id,
          name: tc.name,
          args: tc.args || {},
          result: null
        }
        messages.push(toolMsg)
        pendingToolCalls.set(tc.id, toolMsg)
      }
      if (kwargs.content) {
        messages.push({ type: 'assistant', content: kwargs.content })
      }
    } else if (msgType === 'ToolMessage') {
      const toolCallId = kwargs.tool_call_id
      const toolMsg = pendingToolCalls.get(toolCallId) as any
      if (toolMsg) {
        toolMsg.result = kwargs.content || ''
      }
    }
  }

  return messages
}
