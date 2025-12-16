import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const RouteLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Mostrar loader cuando cambia la ruta
    setIsLoading(true)

    // Ocultar loader después de 2 segundos
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    // Limpiar timer si el componente se desmonta
    return () => {
      clearTimeout(timer)
    }
  }, [location.pathname])

  if (!isLoading) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo translúcido oscuro
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
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
          alt="Logo"
          style={{
            maxWidth: '200px',
            maxHeight: '200px',
            width: 'auto',
            height: 'auto',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}

export default RouteLoader

