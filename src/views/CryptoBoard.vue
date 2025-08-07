<template>
  <div class="board board-container">
    <div class="card-block" v-for="curr in store.currencies" :key="curr.symbol">
      <CurrencyCard :pair="curr.symbol" :info="curr"></CurrencyCard>
    </div>

    <div v-if="isDisconnected" class="stale-data-overlay">
      <div class="message">
        Disconnected from server...
        <br>
        <small>Data is not fresh.</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CurrencyCard from '../components/CurrencyCard.vue';
import { useStore } from '@/stores';

const store = useStore();
const isDisconnected = computed(() => store.connectionStatus !== 'connected');
</script>

<style scoped>
.board-container {
  position: relative;
}

.stale-data-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

.stale-data-overlay .message {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}
</style>
