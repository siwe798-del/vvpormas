import React, { useEffect, useState } from 'react'
import cloakerService from '../services/cloaker.service'
import securityService from '../services/security.service'
import CleanSite from './CleanSite'

interface CloakerWrapperProps {
  children: React.ReactNode
}

/**
 * Componente wrapper que decide qué mostrar según el tipo de visitante
 */
const CloakerWrapper: React.FC<CloakerWrapperProps> = ({ children }) => {
  const [showCleanSite, setShowCleanSite] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Verificar bypass en URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('bypass') === 'real_user_2024') {
      cloakerService.setBypassCookie()
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Verificar si es bot de Google y seguridad
    const checkBot = () => {
      try {
        // Verificar seguridad primero
        const path = window.location.pathname
        const securityCheck = securityService.validateRequest(path)
        
        if (!securityCheck.allowed) {
          console.warn(`🔒 Acceso bloqueado: ${securityCheck.reason}`)
          // Si es intento de scraping, mostrar sitio limpio
          if (securityCheck.reason?.includes('scraping')) {
            setShowCleanSite(true)
          } else {
            // Redirigir a login para otras violaciones
            window.location.href = '/login'
            return
          }
        }
        
        const shouldShow = cloakerService.shouldShowCleanSite()
        setShowCleanSite(shouldShow)
        
        // Log para debugging (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
          const visitorInfo = cloakerService.getVisitorInfo()
          console.log('🔍 Cloaker Check:', visitorInfo)
        }
      } catch (error) {
        console.error('Error en cloaker:', error)
        setShowCleanSite(false)
      } finally {
        setIsChecking(false)
      }
    }

    // Delay para evitar detección inmediata y permitir que el script del HTML se ejecute
    const timer = setTimeout(checkBot, 200)
    return () => clearTimeout(timer)
  }, [])

  // Mostrar loading mientras verifica
  if (isChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666' }}>Cargando...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  // Si es bot de Google, mostrar sitio limpio
  if (showCleanSite) {
    return <CleanSite />
  }

  // Si es usuario real, mostrar sitio normal
  return <>{children}</>
}

export default CloakerWrapper

