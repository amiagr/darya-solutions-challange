<template>
  <transition name="status-fade">
    <div v-if="visible" :class="['status-indicator', statusClass]">
      <div class="spinner" v-if="isLoading"></div>
      <span>{{ statusText }}</span>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { pingStatus, pingLatency } from '@/services/PingService';

const visible = ref(false)
let visibilityTimeout: ReturnType<typeof setTimeout> | null = null

const isLoading = computed(() => {
  return pingStatus.value === 'reconnecting' || pingStatus.value === 'initializing'
})

const statusText = computed(() => {
  switch (pingStatus.value) {
    case 'initializing':
    case 'reconnecting':
      return 'Trying to reconnect...'
    case 'connected':
      return `${pingLatency.value} ms`
    case 'disconnected':
      return 'Disconnected!'
    default:
      return ''
  }
})

const statusClass = computed(() => {
  switch (pingStatus.value) {
    case 'initializing':
    case 'reconnecting':
      return 'connecting'
    case 'connected':
      return 'online'
    case 'disconnected':
      return 'offline'
    default:
      return ''
  }
})

watch(pingStatus, (newStatus) => {
  if (visibilityTimeout) {
    clearTimeout(visibilityTimeout)
  }

  if (newStatus === 'reconnecting' || newStatus === 'disconnected' || newStatus === 'initializing') {
    visible.value = true
  }

  else if (newStatus === 'connected') {
    visible.value = true
    // visibilityTimeout = setTimeout(() => {
    //   visible.value = false
    // }, 3000)
  }
  else {
    // visible.value = false
  }
}, { immediate: true })

</script>

<style scoped>
.status-indicator {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-family: sans-serif;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.status-indicator.online {
  background-color: #28a745;
}
.status-indicator.connecting {
  background-color: #007bff;
}
.status-indicator.offline {
  background-color: #dc3545;
}

.status-fade-enter-active,
.status-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.status-fade-enter-from,
.status-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: white;
  border-radius: 50%;
  margin-right: 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
