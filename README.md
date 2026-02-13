# TermAgent

Un agente AI conversazionale con accesso a tool (sandbox bash, file system, web fetch, grafici, HTML rendering) costruito con LangChain/LangGraph. Espone un server HTTP con streaming SSE e un frontend Vue.js integrato.

---

## Quick Start

### 1. Requisiti

- **Node.js** ≥ 20 LTS
- **npm**
- Una API key per almeno uno dei provider supportati:
  - [Anthropic](https://console.anthropic.com/) (Claude)
  - [OpenAI](https://platform.openai.com/)
- (Opzionale) **Docker** — solo se vuoi eseguire i comandi bash in un container isolato

### 2. Installazione

```bash
git clone <repo-url>
cd termagent
npm install
```

### 3. Configurazione

Copia il file di esempio e inserisci la tua API key:

```bash
cp .env.example .env
```

Configurazione minima nel `.env`:

```env
MODEL_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

Oppure per OpenAI:

```env
MODEL_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

### 4. Avvio

**Server HTTP** (consigliato — espone API + SSE streaming):

```bash
npm run http
```

Il server parte su `http://localhost:3000`. Apri `index.html` nel browser per usare il frontend.

**CLI interattiva** (alternativa per uso da terminale):

```bash
npm run cli
```

Digita i messaggi e ricevi risposte direttamente nel terminale. Scrivi `exit` per uscire, `/state` per un dump dello stato.

---

## Configurazione completa

Tutte le variabili sono nel `.env`. Ecco le sezioni principali:

### Provider e modello

| Variabile | Default | Descrizione |
|---|---|---|
| `MODEL_PROVIDER` | `anthropic` | `anthropic` oppure `openai` |
| `ANTHROPIC_API_KEY` | — | API key Anthropic |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-20250514` | Modello Anthropic da usare |
| `OPENAI_API_KEY` | — | API key OpenAI |
| `OPENAI_MODEL` | `gpt-4o` | Modello OpenAI da usare |

### Gruppi di tool

Ogni gruppo può essere abilitato/disabilitato indipendentemente:

| Variabile | Default | Tool inclusi |
|---|---|---|
| `TOOLS_SANDBOX` | `true` | `bash`, `view`, `create_file`, `str_replace`, `present_files` |
| `TOOLS_WEB` | `true` | `web_fetch` |
| `TOOLS_OUTPUT` | `true` | `chart_display`, `render_html` |

### Sandbox

| Variabile | Default | Descrizione |
|---|---|---|
| `SANDBOX_MODE` | `local` | `local` (filesystem diretto) oppure `docker` (container isolato) |
| `SANDBOX_WORKING_DIR` | `./workspace` | Directory di lavoro dell'agente |
| `SANDBOX_TIMEOUT` | `30000` | Timeout comandi in ms |

Per la modalità Docker:

```bash
docker compose build
docker compose up -d
```

Poi imposta `SANDBOX_MODE=docker` nel `.env`. Il container monta `./workspace` dentro `/workspace` e include Node.js 20, Python 3, git e tool comuni.

### Persistenza conversazioni (Checkpointer)

| Variabile | Default | Descrizione |
|---|---|---|
| `CHECKPOINTER_TYPE` | `memory` | `memory` (volatile), `sqlite`, `postgres` |
| `SQLITE_DB_PATH` | `./data/checkpoints.db` | Path del database SQLite |
| `DATABASE_URL` | — | Connection string PostgreSQL |

Con `memory` le conversazioni si perdono al riavvio. Usa `sqlite` o `postgres` per persistenza e per abilitare il listing dei thread nell'endpoint `GET /threads`.

### Server e filesystem

| Variabile | Default | Descrizione |
|---|---|---|
| `PORT` | `3000` | Porta del server HTTP |
| `WORKSPACE_PATH` | `./workspace` | Root dei file accessibili all'agente |
| `OUTPUTS_PATH` | `./outputs` | Directory per i file scaricabili |
| `MAX_FILE_SIZE` | `104857600` | Dimensione massima file (100MB) |

---

## Architettura del progetto

### Panoramica

```
src/
├── agent.ts            # Crea l'agente LangGraph (model + tools + checkpointer)
├── http.ts             # Server Express con endpoint REST + SSE
├── cli.ts              # Interfaccia CLI interattiva
├── bootstrap.ts        # Inizializzazione servizi (avvio container Docker se necessario)
├── systemPrompt.ts     # System prompt dinamico con data/ora e config
├── mcpTools.ts         # Integrazione MCP (Model Context Protocol) per tool esterni
├── models/             # Factory per i modelli (Anthropic, OpenAI)
├── tools/              # Definizione di tutti i tool dell'agente
├── services/           # Servizi core (config, FileService, BashSandbox, executors)
├── memory/             # Checkpointer (in-memory, SQLite, PostgreSQL)
└── streamParser/       # Parser unificato dello stream LangGraph
```

### L'agente

L'agente è creato con LangGraph (`createAgent`) e combina:
- Un modello LLM (Anthropic o OpenAI)
- Un set di tool configurabili
- Un checkpointer per la persistenza delle conversazioni
- Un system prompt generato dinamicamente

L'agente opera in un loop: riceve un messaggio, decide se rispondere direttamente o invocare uno o più tool, riceve i risultati, e continua fino a produrre una risposta finale.

### I tool

**Sandbox** — operazioni su file e shell:
- `bash` — Esegue comandi shell nella directory workspace. In modalità `local` usa il sistema host (con blacklist di comandi pericolosi), in modalità `docker` esegue dentro un container isolato.
- `view` — Legge il contenuto di un file o elenca il contenuto di una directory.
- `create_file` — Crea un file con il contenuto specificato (path relativo al workspace).
- `str_replace` — Trova e sostituisce testo in un file esistente.
- `present_files` — Copia file nella directory `outputs/` e restituisce URL di download.

**Web:**
- `web_fetch` — Scarica il contenuto di un URL, estrae il testo da HTML (rimuove script/style/tag), tronca a 50KB.

**Output** — tool visivi per il frontend:
- `chart_display` — Genera dati strutturati per grafici (bar, line, pie). Il risultato è un JSON con labels, datasets e tipo di grafico, che il frontend renderizza con Chart.js.
- `render_html` — Restituisce HTML/CSS/JS arbitrario che il frontend mostra in un iframe sandboxed. Utile per tabelle, visualizzazioni interattive, mini-app.

### Comunicazione SSE (Server-Sent Events)

L'endpoint `POST /chat` accetta un messaggio e restituisce uno stream SSE. Ogni evento è una riga `data: {json}\n\n` con un campo `type` che identifica il tipo di evento.

**Tipi di evento:**

| Tipo | Payload | Descrizione |
|---|---|---|
| `thread_id` | `{ threadId: string }` | Inviato subito, identifica la conversazione |
| `token` | `{ content: string }` | Token di testo generato dal modello (streaming incrementale) |
| `thinking` | `{ content: string }` | Contenuto di "ragionamento" del modello (extended thinking Anthropic, reasoning OpenAI) |
| `tool_call` | `{ id, name, args, isComplete }` | Invocazione di un tool. Arriva prima con `isComplete: false` e args parziali (man mano che il modello genera il JSON), poi con `isComplete: true` e args completi |
| `tool_result` | `{ id, name, content }` | Risultato dell'esecuzione del tool (stringa JSON) |
| `error` | `{ message: string }` | Errore durante l'elaborazione |
| `done` | `{}` | Fine dello stream |

**Esempio di flusso SSE per una richiesta:**

```
data: {"type":"thread_id","threadId":"abc-123"}

data: {"type":"token","content":"Certo, "}
data: {"type":"token","content":"creo il file..."}
data: {"type":"tool_call","id":"tc_1","name":"create_file","args":{"path":"hello.py"},"isComplete":false}
data: {"type":"tool_call","id":"tc_1","name":"create_file","args":{"path":"hello.py","content":"print('hello')"},"isComplete":true}
data: {"type":"tool_result","id":"tc_1","name":"create_file","content":"{\"success\":true,...}"}
data: {"type":"token","content":"File creato!"}
data: {"type":"done"}
```

**Come sfruttare gli eventi SSE in un frontend:**

1. Fai una `POST /chat` con `{ message, threadId }` (threadId opzionale, ne viene generato uno se assente)
2. Leggi lo stream con un `ReadableStream` reader
3. Parsa ogni riga `data: ...` come JSON
4. Accumula i `token` per costruire il testo della risposta in tempo reale
5. Traccia i `tool_call` per mostrare quali tool l'agente sta usando (con args parziali per feedback immediato)
6. Usa i `tool_result` per renderizzare output speciali (grafici da `chart_display`, iframe da `render_html`, link download da `present_files`)
7. Al `done`, finalizza il messaggio

Il campo `isComplete` nei `tool_call` permette di mostrare un'anteprima progressiva: ad esempio, il nome del file che sta per essere creato appare prima che il modello abbia finito di generare il contenuto.

### Endpoint HTTP

| Metodo | Path | Descrizione |
|---|---|---|
| `POST` | `/chat` | Invia messaggio, ricevi stream SSE |
| `GET` | `/history/:threadId` | Recupera lo storico completo di una conversazione |
| `GET` | `/threads` | Lista tutti i thread salvati (richiede checkpointer sqlite/postgres) |
| `GET` | `/outputs/*` | File statici scaricabili (generati da `present_files`) |
| `GET` | `/health` | Health check |

### Stream Parser

Il modulo `streamParser` è un parser unificato che gestisce lo stream LangGraph indipendentemente dal provider (Anthropic o OpenAI). Normalizza le differenze tra i formati dei due provider (ad esempio `thinking` vs `reasoning`) e gestisce il parsing incrementale degli argomenti dei tool call, estraendo campi completati da JSON parziali man mano che il modello li genera.
