<template>
  <div class="layout-container">
    <transition name="fade">
      <header
        v-if="connectionBannerVisible"
        :class="['connection-status-banner', connectionStatusColor]">
        <button
          class="back-btn"
          v-if="currentPage === 'infoview'"
          @click="router.push({ path: '/' })"
        >
          <b class="left-arrow"></b>
        </button>
        <span class="page-title">{{ connectionStatusText }}</span>
      </header>
    </transition>
    <div class="page-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <ConnectionStatus />
  </div>
</template>

<script setup lang="ts">
import Api from '@/services/Api'
import { computed, watchEffect, ref, watch } from 'vue'
import { useRouter, useRoute, type RouteLocationNormalized } from 'vue-router'
import ConnectionStatus from '@/components/ConnectionStatus.vue'

const currentPage = ref('dashboard')
const router = useRouter()
const route = useRoute()

watch(
  route,
  (to: RouteLocationNormalized) => {
    currentPage.value = to.name as string
  },
  { deep: true }
)

const api = new Api()
const connectionStatus = api.getConnectionStatus()

const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return 'Connected'
    case 'reconnecting':
      return 'Reconnecting...'
    case 'disconnected':
      return 'Disconnected'
    default:
      return ''
  }
})

const connectionStatusColor = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return 'connected'
    case 'reconnecting':
      return 'reconnecting'
    case 'disconnected':
      return 'disconnected'
    default:
      return ''
  }
})

// برای کنترل نمایش بنر
const connectionBannerVisible = ref(false)
let connectedTimeout: ReturnType<typeof setTimeout> | null = null

watchEffect(() => {
  console.log({ connectionStatus: connectionStatus.value })
  if (connectionStatus.value === 'connected') {
    connectionBannerVisible.value = true
    if (connectedTimeout) clearTimeout(connectedTimeout)
    connectedTimeout = setTimeout(() => {
      connectionBannerVisible.value = false
    }, 2000)
  } else if (connectionStatus.value === 'reconnecting' || connectionStatus.value === 'disconnected') {
    connectionBannerVisible.value = true
    if (connectedTimeout) clearTimeout(connectedTimeout)
  }
})
</script>
