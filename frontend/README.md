# @energeeno/agent-chat

Libreria Vue 3 per integrare un'interfaccia chat con agenti AI basati su LangGraph/LangChain.

## Caratteristiche

- 🎯 **Componente Vue 3** con Composition API e TypeScript
- 📡 **Streaming SSE** per risposte in tempo reale
- 🔧 **Visualizzazione tool calls** con parametri e risultati
- 💬 **Gestione conversazioni** con supporto multi-thread
- 🎨 **Stili personalizzabili** tramite CSS variables
- 📤 **Eventi emessi** per integrazione con logica esterna
- 🔌 **API programmatica** per invio messaggi da codice

---

## Installazione

```bash
npm install @energeeno/agent-chat
```

---

## Uso rapido

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AgentChat } from '@energeeno/agent-chat'
import type { AgentChatExpose, ToolCallEvent, ToolResultEvent } from '@energeeno/agent-chat'
import '@energeeno/agent-chat/style.css'

const chatRef = ref<AgentChatExpose | null>(null)

function onToolCall(event: ToolCallEvent) {
  console.log('Tool chiamato:', event.name, event.args)
}

function onToolResult(event: ToolResultEvent) {
  console.log('Risultato tool:', event.name, event.content)
}

// Invio programmatico
function sendFromCode() {
  chatRef.value?.sendMessage('Messaggio inviato da codice!')
}
</script>

<template>
  <AgentChat
    ref="chatRef"
    api-url="http://localhost:3000"
    :show-threads="true"
    @tool-call="onToolCall"
    @tool-result="onToolResult"
  />
</template>
```

---

## Props

| Prop | Tipo | Default | Descrizione |
|------|------|---------|-------------|
| `apiUrl` | `string` | **required** | URL base dell'API dell'agente |
| `showThreads` | `boolean` | `true` | Mostra la sidebar con lista conversazioni |
| `threadId` | `string` | `undefined` | ID thread per riprendere una conversazione (solo se `showThreads=false`) |

### Comportamento

- **`showThreads=true`**: mostra sidebar con tutte le conversazioni, l'utente può selezionarne una o crearne una nuova
- **`showThreads=false` + `threadId`**: carica direttamente la conversazione specificata
- **`showThreads=false` senza `threadId`**: inizia una nuova conversazione

---

## Eventi

| Evento | Payload | Descrizione |
|--------|---------|-------------|
| `tool-call` | `ToolCallEvent` | Emesso quando l'agente chiama un tool |
| `tool-result` | `ToolResultEvent` | Emesso quando un tool restituisce un risultato |

### Tipi payload

```typescript
interface ToolCallEvent {
  id: string                      // ID univoco della chiamata
  name: string                    // Nome del tool
  args: Record<string, unknown>   // Parametri passati al tool
}

interface ToolResultEvent {
  id: string    // ID della chiamata (corrisponde a ToolCallEvent.id)
  name: string  // Nome del tool
  content: string // Risultato restituito dal tool
}
```

---

## API programmatica

Il componente espone metodi accessibili tramite `ref` per inviare messaggi come se fossero scritti dall'utente (human message).

```typescript
interface AgentChatExpose {
  /** Invia un human message programmaticamente */
  sendMessage: (message: string) => Promise<void>
}
```

### Esempio

Utile per pre-popolare la chat con una domanda iniziale o per integrare con altri elementi dell'interfaccia:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AgentChat } from '@energeeno/agent-chat'
import type { AgentChatExpose } from '@energeeno/agent-chat'

const chatRef = ref<AgentChatExpose | null>(null)

// Invia una domanda iniziale quando il componente è montato
onMounted(() => {
  chatRef.value?.sendMessage('Qual è il meteo a Roma?')
})

// Oppure da un bottone esterno
function chiediPrevisioni() {
  chatRef.value?.sendMessage('Mostrami le previsioni per domani')
}
</script>

<template>
  <AgentChat ref="chatRef" api-url="http://localhost:3000" />
  <button @click="chiediPrevisioni">Chiedi previsioni</button>
</template>
```

---

## Personalizzazione stili

Gli stili usano CSS custom properties. Puoi sovrascriverle nel tuo CSS:

```css
.agent-chat {
  --ac-bg-primary: #1a1a2e;
  --ac-bg-secondary: #16213e;
  --ac-bg-message: #2d3436;
  --ac-bg-user: #4a69bd;
  --ac-text-primary: #eee;
  --ac-text-secondary: #aaa;
  --ac-accent: #4a69bd;
  --ac-tool-call: #f39c12;
  --ac-tool-result: #27ae60;
  /* ... altre variabili in src/styles/default.css */
}
```

---

## Struttura del progetto

```
frontend/
├── src/
│   ├── components/
│   │   ├── AgentChat.vue      # Componente principale (orchestratore)
│   │   ├── ChatMessage.vue    # Singolo messaggio (user/assistant)
│   │   ├── ToolExecution.vue  # Visualizzazione tool call/result
│   │   ├── ThreadSidebar.vue  # Sidebar lista conversazioni
│   │   └── ChatInput.vue      # Area input con bottone invio
│   ├── composables/
│   │   ├── useChat.ts         # Logica invio messaggi e streaming
│   │   ├── useThreads.ts      # Gestione lista thread e history
│   │   └── useSSE.ts          # Parser stream SSE
│   ├── types/
│   │   └── index.ts           # Definizioni TypeScript
│   ├── styles/
│   │   └── default.css        # Stili di default
│   └── index.ts               # Entry point exports
├── demo/
│   ├── App.vue                # App demo showcase
│   └── main.ts                # Entry point demo
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Responsabilità componenti

| Componente | Responsabilità |
|------------|----------------|
| `AgentChat` | Orchestrazione, gestione stato, esposizione API pubblica |
| `ChatMessage` | Rendering messaggio singolo con supporto Markdown |
| `ToolExecution` | Visualizzazione chiamata tool con args e risultato |
| `ThreadSidebar` | Lista conversazioni, selezione, creazione nuova |
| `ChatInput` | Input utente, gestione invio con Enter |

### Responsabilità composables

| Composable | Responsabilità |
|------------|----------------|
| `useChat` | Invio messaggi, parsing stream SSE, gestione stato loading |
| `useThreads` | Fetch lista thread, caricamento history, conversione formato |
| `useSSE` | Parsing low-level dello stream SSE |

---

## Demo

Il progetto include una demo funzionante per testare la libreria:

```bash
cd frontend
npm install
npm run dev
```

Apri `http://localhost:5173` nel browser.

La demo mostra:
- Componente AgentChat in azione
- Toggle per mostrare/nascondere la sidebar thread
- Bottone per invio messaggio programmatico
- Log in console degli eventi `tool-call` e `tool-result`

> **Nota**: La demo richiede che il server backend sia in esecuzione su `http://localhost:3000`

---

## Build

### Build libreria (per pubblicazione)

```bash
npm run build:lib
```

Output in `dist/`:
- `agent-chat.js` - ESM module
- `agent-chat.umd.cjs` - UMD module
- `style.css` - Stili
- `index.d.ts` - Definizioni TypeScript

### Build demo (per deploy statico)

```bash
npm run build
```

---

## Pubblicazione su npm

1. Assicurati di aver fatto login su npm:
   ```bash
   npm login
   ```

2. Aggiorna la versione in `package.json`

3. Builda la libreria:
   ```bash
   npm run build:lib
   ```

4. Pubblica:
   ```bash
   npm publish --access public
   ```

> **Nota**: Il pacchetto è configurato come scoped (`@energeeno/agent-chat`). Per pubblicare pacchetti scoped pubblici serve `--access public`.

---

## API Backend richiesta

La libreria si aspetta un backend con questi endpoint:

### `POST /chat`

Invia un messaggio all'agente e riceve la risposta in streaming SSE.

**Request:**
```typescript
{
  message: string      // Testo del messaggio utente
  threadId?: string    // ID conversazione (opzionale, se omesso ne crea una nuova)
}
```

**Response:** Stream SSE con i seguenti eventi:

| Evento | Payload | Quando viene emesso |
|--------|---------|---------------------|
| `thread_id` | `{ threadId: string }` | Subito all'inizio, comunica l'ID della conversazione (nuovo o esistente) |
| `token` | `{ content: string }` | Per ogni token generato dall'LLM durante lo streaming della risposta |
| `tool_call` | `{ id: string, name: string, args: object }` | Quando l'agente decide di chiamare un tool, prima dell'esecuzione |
| `tool_result` | `{ id: string, name: string, content: string }` | Quando un tool completa l'esecuzione e restituisce il risultato |
| `done` | `{}` | Quando l'agente ha completato la risposta |
| `error` | `{ message: string }` | In caso di errore durante l'elaborazione |

**Flusso tipico con GPT-4o:**
```
thread_id → tool_call → tool_result → token → token → ... → done
```

> **Nota**: Con modelli OpenAI (GPT-4o, GPT-4, ecc.) quando l'agente decide di chiamare un tool, non emette token di testo prima della chiamata. I token della risposta arrivano solo dopo aver ricevuto i risultati dei tool.

---

### `GET /threads`

Restituisce la lista di tutte le conversazioni salvate.

**Response:**
```typescript
{
  threads: string[]    // Array di thread ID
}
```

---

### `GET /history/:threadId`

Restituisce lo storico completo dei messaggi di una conversazione.

**Request:**
- `threadId` (path param): ID della conversazione

**Response:**
```typescript
{
  threadId: string
  messages: LangChainMessage[]   // Array di messaggi in formato LangChain
}
```

I messaggi sono in formato LangChain serializzato e vengono convertiti internamente dalla libreria nel formato di visualizzazione.

---

## Licenza

MIT
