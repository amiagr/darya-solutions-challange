import { ref } from 'vue'

interface WsEvent extends Event {
  endpoint: string
}
type MessageHandler = (message: MessageEvent) => void
type ErrorHandler = (error: WsEvent) => void
type EventHandler = (event: WsEvent) => void

interface WebSocketWrapperOptions {
  url: string
  maxReconnectAttempts?: number
  backoffBase?: number
  maxBackoffDelay?: number
}

export const wsConnectionStatus = ref<
  'connected' | 'disconnected' | 'reconnecting' | 'initializing'
>('initializing')

class WebSocketWrapper {
  private url: string
  private maxReconnectAttempts: number
  private reconnectAttempts: number = 0
  private websocket: WebSocket | null = null
  private isConnected: boolean = false

  // --- NEW: Backoff Config Properties ---
  private readonly backoffBase: number
  private readonly maxBackoffDelay: number
  // ------------------------------------

  private messageHandlers: MessageHandler[] = []
  private errorHandlers: ErrorHandler[] = []
  private onOpenHandler: EventHandler | null = null
  private onCloseHandler: ErrorHandler | null = null

  constructor(options: WebSocketWrapperOptions) {
    this.url = options.url
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? Infinity

    // --- Initializing Backoff Settings ---
    this.backoffBase = options.backoffBase ?? 1000
    this.maxBackoffDelay = options.maxBackoffDelay ?? 30000
    // ------------------------------------------

    this.connect()
  }

  public connect(): void {
    if (this.isConnected) return

    this.websocket = new WebSocket(this.url)

    this.websocket.onopen = (ev: Event) => {
      console.log('WebSocket connected on:', this.url)
      const e: WsEvent = { ...ev, endpoint: this.url }
      this.isConnected = true
      wsConnectionStatus.value = 'connected'
      this.reconnectAttempts = 0
      if (this.onOpenHandler) this.onOpenHandler(e)
    }

    this.websocket.onmessage = (event) => {
      this.messageHandlers.forEach((handler) => handler(event))
    }

    this.websocket.onerror = (error) => {
      console.error('WebSocket error on', this.url, error)
      const errorEvent: WsEvent = { ...error, endpoint: this.url }
      this.errorHandlers.forEach((handler) => handler(errorEvent))
    }

    this.websocket.onclose = (ev: CloseEvent) => {
      console.warn('WebSocket closed for:', this.url)
      this.isConnected = false
      wsConnectionStatus.value = 'reconnecting'
      const closeEvent: WsEvent = { ...ev, endpoint: this.url }
      if (this.onCloseHandler) this.onCloseHandler(closeEvent)

      if (ev.code !== 1000 && ev.code !== 1005) {
        this.reconnect()
      }
    }
  }

  // --- The reconnect method with Exponential Backoff ---
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      wsConnectionStatus.value = 'disconnected'
      console.error(`Max reconnect attempts reached for ${this.url}. Giving up.`)
      return
    }

    const delay = Math.min(this.backoffBase * 2 ** this.reconnectAttempts, this.maxBackoffDelay)
    const jitter = Math.floor(Math.random() * 1000)
    const nextDelay = delay + jitter

    console.log(
      `Reconnecting to ${this.url} in ~${Math.round(nextDelay / 1000)}s... (Attempt ${this.reconnectAttempts + 1})`
    )

    this.reconnectAttempts++
    setTimeout(() => this.connect(), nextDelay)
  }
  // -----------------------------------------------------------------

  public close(): void {
    this.maxReconnectAttempts = 0
    this.websocket?.close(1000)
    wsConnectionStatus.value = 'disconnected'
    this.isConnected = false
  }

  public onMessage(handler: MessageHandler): void {
    this.messageHandlers.push(handler)
  }

  public onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler)
  }

  public onOpen(handler: EventHandler): void {
    this.onOpenHandler = handler
  }

  public onClose(handler: ErrorHandler): void {
    this.onCloseHandler = handler
  }
}

export default WebSocketWrapper
