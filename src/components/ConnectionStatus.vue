<template>
  <div class="connection-status" :class="statusClass">
    <span v-if="!isOnline">No Network</span>
    <span v-else-if="!isConnected">Reconnecting...</span>
    <span v-else>Connected</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNetworkStatus } from '@/composables/useNetworkStatus'
import Api from '@/services/api.ts'

const { isOnline } = useNetworkStatus()

const api = new Api()
const isAlive = api.getIsAlive()

const statusClass = computed(() => {
  if (!isOnline.value) return 'disconnected'
  if (!isAlive) return 'connecting'
  return 'connected'
})
</script>

<style scoped>
.connection-status {
  position: fixed;
  bottom: 10px;
  left: 10px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  color: white;
  transition: 0.3s all;
}
.connected {
  background-color: #2ecc71;
}
.connecting {
  background-color: #f1c40f;
}
.disconnected {
  background-color: #e74c3c;
}
</style>
