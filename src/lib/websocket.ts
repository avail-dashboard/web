import { io, Socket } from 'socket.io-client'

export interface WebSocketConfig {
  url: string
  autoConnect?: boolean
  reconnection?: boolean
  reconnectionAttempts?: number
  reconnectionDelay?: number
}

export interface SubscriptionOptions {
  appId?: number
  validatorAddress?: string
  timeframe?: string
  filters?: Record<string, unknown>
}

export class AvailWebSocket {
  private socket: Socket | null = null
  private config: WebSocketConfig
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private subscriptions = new Set<string>()

  constructor(config: WebSocketConfig) {
    this.config = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...config,
    }
    console.log('🔧 WebSocket config:', this.config)
  }

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('🔌 WebSocket already connected')
      return
    }

    console.log('🔌 Attempting to connect WebSocket to:', this.config.url)

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.url, {
          autoConnect: this.config.autoConnect,
          reconnection: this.config.reconnection,
          reconnectionAttempts: this.config.reconnectionAttempts,
          reconnectionDelay: this.config.reconnectionDelay,
          transports: ['websocket', 'polling'], // Allow both transports
        })

        this.socket.on('connect', () => {
          console.log('🔌 WebSocket connected successfully!')
          console.log('🔌 Socket ID:', this.socket?.id)
          this.isConnected = true
          this.reconnectAttempts = 0
          resolve()
        })

        this.socket.on('disconnect', reason => {
          console.log('🔌 WebSocket disconnected:', reason)
          this.isConnected = false
          this.handleDisconnection()
        })

        this.socket.on('connect_error', error => {
          console.error('❌ WebSocket connection error:', error)
          console.error('❌ Error details:', error.message)
          this.isConnected = false
          reject(error)
        })

        this.socket.on('reconnect', attemptNumber => {
          console.log(
            `🔄 WebSocket reconnected after ${attemptNumber} attempts`
          )
          this.isConnected = true
          this.resubscribeAll()
        })

        this.socket.on('reconnect_attempt', attemptNumber => {
          console.log(
            `🔄 Attempting to reconnect WebSocket (${attemptNumber}/${this.maxReconnectAttempts})`
          )
        })

        this.socket.on('reconnect_failed', () => {
          console.error('❌ Max WebSocket reconnection attempts reached')
          this.isConnected = false
        })

        // Handle server responses
        this.socket.on('connected', data => {
          console.log('✅ WebSocket server response:', data)
        })

        // Add timeout for connection
        setTimeout(() => {
          if (!this.isConnected) {
            console.error('❌ WebSocket connection timeout')
            reject(new Error('WebSocket connection timeout'))
          }
        }, 10000)
      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error)
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...')
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.subscriptions.clear()
      console.log('🔌 WebSocket disconnected')
    }
  }

  // Basic subscriptions
  subscribe(topic: string, options?: SubscriptionOptions): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ WebSocket not connected, cannot subscribe to:', topic)
      return
    }

    console.log(`📡 Subscribing to ${topic}`, options)
    this.socket.emit(`subscribe:${topic}`, options)
    this.subscriptions.add(topic)
    console.log(`📡 Subscribed to ${topic}`, options)
  }

  unsubscribe(topic: string): void {
    if (!this.socket?.connected) {
      return
    }

    console.log(`📡 Unsubscribing from ${topic}`)
    this.socket.emit('unsubscribe', topic)
    this.subscriptions.delete(topic)
    console.log(`📡 Unsubscribed from ${topic}`)
  }

  unsubscribeAll(): void {
    if (!this.socket?.connected) {
      return
    }

    console.log('📡 Unsubscribing from all topics')
    this.socket.emit('unsubscribe:all')
    this.subscriptions.clear()
    console.log('📡 Unsubscribed from all topics')
  }

  // Event listeners
  on(event: string, callback: (data: unknown) => void): void {
    if (!this.socket) {
      console.warn('⚠️ WebSocket not initialized')
      return
    }

    console.log(`👂 Setting up listener for event: ${event}`)
    this.socket.on(event, callback)
  }

  off(event: string, callback?: (data: unknown) => void): void {
    if (!this.socket) {
      return
    }

    if (callback) {
      this.socket.off(event, callback)
    } else {
      this.socket.off(event)
    }
  }

  // Convenience methods for common subscriptions
  subscribeToBlocks(callback: (data: unknown) => void): void {
    this.subscribe('blocks')
    this.on('block:new', callback)
  }

  subscribeToExtrinsics(callback: (data: unknown) => void): void {
    this.subscribe('extrinsics')
    this.on('extrinsic:new', callback)
  }

  subscribeToChainStats(callback: (data: unknown) => void): void {
    this.subscribe('chain')
    this.on('chain:stats', callback)
  }

  subscribeToValidators(
    callback: (data: unknown) => void,
    options?: SubscriptionOptions
  ): void {
    this.subscribe('validators', options)
    this.on('validators:update', callback)
  }

  subscribeToRollups(callback: (data: unknown) => void): void {
    this.subscribe('rollups')
    this.on('rollups:update', callback)
  }

  subscribeToDataSubmissions(
    callback: (data: unknown) => void,
    options?: SubscriptionOptions
  ): void {
    this.subscribe('data-submissions', options)
    this.on('data-submissions:new', callback)
  }

  // Utility methods
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true
  }

  get socketId(): string | undefined {
    return this.socket?.id
  }

  private handleDisconnection(): void {
    // Implement any cleanup logic here
    console.log('🔧 Handling WebSocket disconnection...')
  }

  private resubscribeAll(): void {
    // Re-subscribe to all previous subscriptions after reconnection
    console.log(
      '🔄 Re-subscribing to all topics:',
      Array.from(this.subscriptions)
    )
    this.subscriptions.forEach(topic => {
      if (this.socket?.connected) {
        this.socket.emit(`subscribe:${topic}`)
        console.log(`🔄 Re-subscribed to ${topic}`)
      }
    })
  }
}

// Validate required environment variables
const wsUrl = process.env.NEXT_PUBLIC_WS_URL
if (!wsUrl) {
  throw new Error('NEXT_PUBLIC_WS_URL environment variable is required but not set')
}

// Create and export WebSocket instance
const wsConfig: WebSocketConfig = {
  url: wsUrl,
  autoConnect: false, // We'll connect manually
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
}

console.log('🚀 Creating WebSocket instance with config:', wsConfig)
export const availWS = new AvailWebSocket(wsConfig)

// Export for backward compatibility
export default availWS
