/** Configurazione del componente AgentChat */
export interface AgentChatConfig {
  /** URL base dell'API dell'agente */
  apiUrl: string
  /** Se true, mostra la sidebar con la lista delle conversazioni */
  showThreads: boolean
  /** Thread ID per riprendere una conversazione esistente (solo se showThreads=false) */
  threadId?: string
}

/** Messaggio nella chat */
export interface ChatMessage {
  type: 'user' | 'assistant'
  content: string
}

/** Esecuzione di un tool */
export interface ToolMessage {
  type: 'tool'
  id: string
  name: string
  args: Record<string, unknown>
  result: string | null
}

/** Unione di tutti i tipi di messaggio visualizzabili */
export type DisplayMessage = ChatMessage | ToolMessage

/** Eventi SSE ricevuti dal server */
export type SSEEvent =
  | { type: 'thread_id'; threadId: string }
  | { type: 'token'; content: string }
  | { type: 'tool_call'; id: string; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; id: string; name: string; content: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

/** Payload emesso con l'evento tool-call */
export interface ToolCallEvent {
  id: string
  name: string
  args: Record<string, unknown>
}

/** Payload emesso con l'evento tool-result */
export interface ToolResultEvent {
  id: string
  name: string
  content: string
}

/** Metodi esposti dal componente AgentChat */
export interface AgentChatExpose {
  /** Invia un messaggio programmaticamente */
  sendMessage: (message: string) => Promise<void>
}
