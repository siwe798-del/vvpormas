import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const RouteLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const location = useLocation()
  const previousPath = useRef(location.pathname)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Solo mostrar loader si cambió la ruta (no en la primera carga)
    if (previousPath.current !== location.pathname) {
      // Ocultar contenido actual
      setShowContent(false)
      setIsLoading(true)

      // Limpiar timer anterior si existe
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      // Mostrar loader durante 2 segundos
      timerRef.current = setTimeout(() => {
        setIsLoading(false)
        // Pequeño delay antes de mostrar el nuevo contenido para transición suave
        setTimeout(() => {
          setShowContent(true)
          previousPath.current = location.pathname
        }, 100)
      }, 2000)
    } else {
      // Primera carga, no mostrar loader
      previousPath.current = location.pathname
    }

    // Limpiar timer si el componente se desmonta
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [location.pathname])

  if (!isLoading) return null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)', // Fondo translúcido oscuro
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          transition: 'opacity 0.3s ease-in-out'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src="/assets/images/logoBlancoR.png"
            alt="Cargando..."
            onError={(e) => {
              // Fallback si la ruta no funciona
              const target = e.target as HTMLImageElement
              target.src = 'assets/images/logoBlancoR.png'
            }}
            style={{
              maxWidth: '250px',
              maxHeight: '250px',
              width: 'auto',
              height: 'auto',
              filter: 'drop-shadow(0 4px 8px rgba(255, 255, 255, 0.2))',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.08);
          }
        }
      `}</style>
    </>
  )
}

export default RouteLoader

