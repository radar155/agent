<script setup lang="ts">
import { ref } from 'vue'
import { AgentChat } from '../src'
import type { AgentChatExpose, ToolCallEvent, ToolResultEvent } from '../src'
import '../src/styles/default.css'

const chatRef = ref<AgentChatExpose | null>(null)

// Config
const apiUrl = 'http://localhost:3000'
const showThreads = ref(false)

// Event handlers
function onToolCall(event: ToolCallEvent) {
  console.log('[Demo] Tool Call:', event)
}

function onToolResult(event: ToolResultEvent) {
  console.log('[Demo] Tool Result:', event)
}

// Programmatic send example
function sendProgrammatic() {
  chatRef.value?.sendMessage('Questo messaggio è stato inviato programmaticamente!')
}
</script>

<template>
  <div class="demo">
    <header class="demo__header">
      <h1>Agent Chat Demo</h1>
      <div class="demo__controls">
        <label>
          <input v-model="showThreads" type="checkbox">
          Mostra threads
        </label>
        <button @click="sendProgrammatic">
          Invia messaggio programmatico
        </button>
      </div>
    </header>
    
    <main class="demo__main">
      <AgentChat
        ref="chatRef"
        :api-url="apiUrl"
        :show-threads="showThreads"
        @tool-call="onToolCall"
        @tool-result="onToolResult"
      />
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #app {
  height: 100%;
}

.demo {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  color: #eee;
}

.demo__header {
  padding: 16px 24px;
  background: #16213e;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demo__header h1 {
  font-size: 20px;
  font-weight: 500;
}

.demo__controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.demo__controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.demo__controls button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #4a69bd;
  color: white;
  cursor: pointer;
}

.demo__controls button:hover {
  background: #3c5aa6;
}

.demo__main {
  flex: 1;
  overflow: hidden;
}
</style>
