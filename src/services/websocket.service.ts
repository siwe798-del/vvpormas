class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private messageQueue: any[] = []
  private pingInterval: NodeJS.Timeout | null = null
  private isConnecting = false
  private connectionTimeout: NodeJS.Timeout | null = null

  connect() {
    // Evitar múltiples conexiones simultáneas
    if (this.isConnecting) {
      console.log('⏳ Conexión ya en progreso...')
      return
    }

    // Si ya está conectado, no hacer nada
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('✅ Ya conectado')
      return
    }

    this.isConnecting = true
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3002'
    console.log(`🔌 Conectando a ${wsUrl}...`)

    try {
      // Limpiar conexión anterior
      this.cleanup()

      // Crear nueva conexión
      this.ws = new WebSocket(wsUrl)

      // Timeout de conexión (3 segundos)
      this.connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          console.error('⏱️ Timeout de conexión')
          this.isConnecting = false
          this.cleanup()
          this.handleMessage({
            type: 'connection_error',
            error: 'El servidor no respondió. Verifica que esté corriendo en el puerto 3002.'
          })
          this.attemptReconnect()
        }
      }, 3000)

      // Eventos del WebSocket
      this.ws.onopen = () => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout)
          this.connectionTimeout = null
        }
        console.log('✅ Conectado al servidor WebSocket')
        this.isConnecting = false
        this.reconnectAttempts = 0

        // Ping periódico
        this.startPing()

        // Procesar cola de mensajes
        this.processMessageQueue()

        // Notificar conexión
        this.handleMessage({ type: 'connected' })
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('Error parseando mensaje:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error)
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout)
          this.connectionTimeout = null
        }
        this.isConnecting = false
      }

      this.ws.onclose = (event) => {
        console.log(`🔌 Desconectado (código: ${event.code})`)
        this.isConnecting = false
        this.stopPing()
        this.handleMessage({ type: 'disconnected' })

        // Reconectar si no fue cierre intencional
        if (event.code !== 1000) {
          this.attemptReconnect()
        }
      }
    } catch (error) {
      console.error('❌ Error creando WebSocket:', error)
      this.isConnecting = false
      this.handleMessage({
        type: 'connection_error',
        error: `Error: ${error instanceof Error ? error.message : 'Desconocido'}`
      })
      this.attemptReconnect()
    }
  }

  private cleanup() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }
    if (this.ws) {
      try {
        this.ws.close()
      } catch (e) {
        // Ignorar errores al cerrar
      }
      this.ws = null
    }
    this.stopPing()
  }

  private startPing() {
    this.stopPing()
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' })
      }
    }, 30000) // Cada 30 segundos
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift()
      this.send(message)
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de intentos alcanzado')
      this.handleMessage({
        type: 'connection_error',
        error: 'No se pudo conectar después de múltiples intentos. Verifica que el servidor esté corriendo.'
      })
      // Resetear después de 30 segundos
      setTimeout(() => {
        this.reconnectAttempts = 0
      }, 30000)
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, 5000)
    console.log(`🔄 Reintentando en ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

    setTimeout(() => {
      if (!this.isConnected()) {
        this.connect()
      }
    }, delay)
  }

  private handleMessage(data: any) {
    // Notificar listeners específicos
    const listeners = this.listeners.get(data.type)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error en listener:', error)
        }
      })
    }

    // Notificar listeners genéricos
    const allListeners = this.listeners.get('*')
    if (allListeners) {
      allListeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error en listener genérico:', error)
        }
      })
    }
  }

  send(data: any) {
    if (this.isConnected()) {
      try {
        this.ws!.send(JSON.stringify(data))
        console.log('📤 Enviado:', data.type)
      } catch (error) {
        console.error('Error enviando:', error)
        this.messageQueue.push(data)
      }
    } else {
      console.warn('⚠️ No conectado, agregando a cola')
      this.messageQueue.push(data)
      if (!this.isConnecting) {
        this.connect()
      }
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  updateSession(sessionData: any) {
    import('./session.service').then(({ default: sessionService }) => {
      let sessionId = sessionData.sessionId || sessionData.idSesion

      if (!sessionId) {
        const storedId = sessionStorage.getItem('idSesion')
        if (storedId) {
          try {
            sessionId = atob(storedId)
          } catch {
            sessionId = storedId
          }
        } else {
          sessionId = sessionService.getSessionId()
        }
      }

      if (!sessionId.startsWith('session_')) {
        sessionId = sessionService.getSessionId()
      }

      this.send({
        type: 'session_update',
        sessionId: sessionId,
        data: {
          ...sessionData,
          sessionId,
          lastActivity: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      })
    }).catch(() => {
      const sessionId = sessionData.sessionId || sessionData.idSesion || `session_${Date.now()}`
      this.send({
        type: 'session_update',
        sessionId: sessionId,
        data: {
          ...sessionData,
          sessionId,
          lastActivity: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      })
    })
  }

  disconnect() {
    this.cleanup()
    this.messageQueue = []
    this.listeners.clear()
    this.reconnectAttempts = 0
  }
}

export default new WebSocketService()
