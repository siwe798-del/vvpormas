import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const NotFound: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Registrar intento de acceso a ruta no válida
    console.warn('Intento de acceso a ruta no válida:', window.location.pathname)
    
    // Redirigir después de 3 segundos
    const timer = setTimeout(() => {
      navigate('/login', { replace: true })
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="wrapper dark" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ 
          backgroundColor: '#2c3e50', 
          padding: '60px 40px', 
          borderRadius: '12px', 
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          maxWidth: '600px',
          margin: '0 auto',
          border: '2px solid #9b59b6'
        }}>
          <div style={{ fontSize: '120px', fontWeight: 'bold', color: '#9b59b6', marginBottom: '20px' }}>
            404
          </div>
          <h1 style={{ color: '#ecf0f1', fontSize: '32px', marginBottom: '20px', fontWeight: '600' }}>
            Página No Encontrada
          </h1>
          <p style={{ color: '#bdc3c7', fontSize: '18px', marginBottom: '30px', lineHeight: '1.6' }}>
            La página que buscas no existe o ha sido movida.
            <br />
            Serás redirigido al inicio en unos segundos.
          </p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            style={{
              backgroundColor: '#9b59b6',
              color: '#fff',
              border: 'none',
              padding: '15px 40px',
              fontSize: '18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(155, 89, 182, 0.4)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#8e44ad'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(155, 89, 182, 0.6)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#9b59b6'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(155, 89, 182, 0.4)'
            }}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound

