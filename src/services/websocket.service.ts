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
  private currentWsUrl: string | null = null
  private fallbackUrls: string[] = []

  private getWebSocketUrls(): { primary: string; fallbacks: string[] } {
    // Primero intentar desde variable de entorno
    if ((import.meta as any).env?.VITE_WS_URL) {
      return { primary: (import.meta as any).env.VITE_WS_URL, fallbacks: [] }
    }

    // Detectar automáticamente el host y protocolo
    const isSecure = window.location.protocol === 'https:'
    const protocol = isSecure ? 'wss:' : 'ws:'
    const hostname = window.location.hostname
    const port = (import.meta as any).env?.VITE_WS_PORT || '3002'
    
    // Si estamos en localhost o IP local, usar localhost con el puerto
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return { primary: `ws://localhost:${port}`, fallbacks: [] }
    }
    
    // Para producción/dominio remoto, generar múltiples opciones
    const urls: string[] = []
    
    // Opción 1: Mismo hostname sin puerto (asumiendo proxy reverso)
    urls.push(`${protocol}//${hostname}`)
    
    // Opción 2: Mismo hostname con puerto
    urls.push(`${protocol}//${hostname}:${port}`)
    
    // Opción 3: Si es HTTPS, también intentar WS (por si el proxy no maneja WSS)
    if (isSecure) {
      urls.push(`ws://${hostname}:${port}`)
    }
    
    return { primary: urls[0], fallbacks: urls.slice(1) }
  }

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
    
    // Obtener URLs (primaria y fallbacks)
    if (!this.currentWsUrl) {
      const urls = this.getWebSocketUrls()
      this.currentWsUrl = urls.primary
      this.fallbackUrls = urls.fallbacks
    }
    
    console.log(`🔌 Conectando a ${this.currentWsUrl}...`)

    try {
      // Limpiar conexión anterior
      this.cleanup()

      // Crear nueva conexión
      this.ws = new WebSocket(this.currentWsUrl!)

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
        console.log(`✅ Conectado al servidor WebSocket en ${this.currentWsUrl}`)
        this.isConnecting = false
        this.reconnectAttempts = 0
        // Limpiar fallbacks ya que la conexión funcionó
        this.fallbackUrls = []

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
        // Código 1000 = cierre normal, 1001 = servidor se fue, 1006 = conexión anormal
        if (event.code !== 1000) {
          // Si fue un error de conexión, intentar con URL alternativa si está disponible
          if (event.code === 1006 && this.fallbackUrls.length > 0) {
            console.log('🔄 Error de conexión, intentando URL alternativa...')
          }
          this.attemptReconnect()
        } else {
          // Si fue cierre normal, resetear estado para permitir reconexión manual
          this.reconnectAttempts = 0
          this.currentWsUrl = null
          this.fallbackUrls = []
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
    // Si hay URLs de fallback disponibles, intentar con la siguiente
    if (this.fallbackUrls.length > 0 && this.reconnectAttempts < this.fallbackUrls.length) {
      this.currentWsUrl = this.fallbackUrls[this.reconnectAttempts]
      console.log(`🔄 Intentando URL alternativa: ${this.currentWsUrl}`)
      this.reconnectAttempts++
      setTimeout(() => {
        if (!this.isConnected() && !this.isConnecting) {
          this.connect()
        }
      }, 1000)
      return
    }

    // Si ya probamos todas las URLs de fallback, resetear y empezar de nuevo
    if (this.fallbackUrls.length > 0 && this.reconnectAttempts >= this.fallbackUrls.length) {
      console.log('🔄 Todas las URLs de fallback probadas, reiniciando...')
      this.reconnectAttempts = 0
      this.currentWsUrl = null
      this.fallbackUrls = []
      // Reiniciar con la URL primaria después de un breve delay
      setTimeout(() => {
        if (!this.isConnected() && !this.isConnecting) {
          this.connect()
        }
      }, 2000)
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de intentos alcanzado')
      this.handleMessage({
        type: 'connection_error',
        error: 'No se pudo conectar después de múltiples intentos. Verifica que el servidor WebSocket esté corriendo y accesible.'
      })
      // Resetear después de 30 segundos
      setTimeout(() => {
        this.reconnectAttempts = 0
        this.currentWsUrl = null
        this.fallbackUrls = []
        // Intentar reconectar automáticamente después del reset
        if (!this.isConnected() && !this.isConnecting) {
          console.log('🔄 Reintentando conexión después del reset...')
          this.connect()
        }
      }, 30000)
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, 5000)
    console.log(`🔄 Reintentando en ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

    setTimeout(() => {
      if (!this.isConnected() && !this.isConnecting) {
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
