// src/services/PingService.ts

import { ref, type Ref } from 'vue'

export const pingStatus: Ref<'connected' | 'disconnected' | 'reconnecting' | 'initializing'> =
  ref('initializing')
export const pingLatency: Ref<number> = ref(0)

class PingManager {
  private websocket: WebSocket | null = null
  private readonly url = 'wss://ws-api.binance.us:443/ws-api/v3'

  private reconnectInterval = 5000
  private maxReconnectAttempts = Infinity
  private reconnectAttempts = 0

  private pingInterval = 2000
  private pongTimeout = 2000
  private heartbeatIntervalId: ReturnType<typeof setInterval> | null = null
  private pongTimeoutId: ReturnType<typeof setTimeout> | null = null
  private lastPingTime = 0

  constructor() {
    this.connect()
  }

  private connect(): void {
    this.websocket = new WebSocket(this.url)
    pingStatus.value = 'initializing'

    this.websocket.onopen = () => {
      console.log('Ping connection established.')
      pingStatus.value = 'connected'
      this.reconnectAttempts = 0
      this.startHeartbeat()
    }

    this.websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if ('id' in data && data.id === this.lastPingTime) {
          clearTimeout(this.pongTimeoutId!)
          pingLatency.value = Date.now() - this.lastPingTime
        }
      } catch (e) {
        console.error('Error: ', e)
      }
    }

    this.websocket.onclose = () => {
      console.warn('Ping connection closed. Attempting to reconnect...')
      this.stopHeartbeat()
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        pingStatus.value = 'reconnecting'
        setTimeout(() => this.connect(), this.reconnectInterval)
        this.reconnectAttempts++
      } else {
        console.error('Max reconnect attempts for ping service reached.')
        pingStatus.value = 'disconnected'
      }
    }

    this.websocket.onerror = (error) => {
      console.error('Ping connection error:', error)
      this.websocket?.close()
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatIntervalId = setInterval(() => {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.lastPingTime = Date.now()
        this.websocket.send(JSON.stringify({ method: 'ping', id: this.lastPingTime }))

        this.pongTimeoutId = setTimeout(() => {
          console.warn('Pong not received. Closing ping connection.')
          this.websocket?.close()
        }, this.pongTimeout)
      }
    }, this.pingInterval)
  }

  private stopHeartbeat(): void {
    clearInterval(this.heartbeatIntervalId!)
    clearTimeout(this.pongTimeoutId!)
  }
}

new PingManager()
