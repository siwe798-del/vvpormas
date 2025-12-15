import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DashboardLogin: React.FC = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password === 'Tacos99') {
      // Guardar autenticación en sessionStorage
      sessionStorage.setItem('dashboard_authenticated', 'true')
      sessionStorage.setItem('dashboard_auth_time', Date.now().toString())
      navigate('/dashboard')
    } else {
      setError('Contraseña incorrecta')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#2c3e50',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#34495e',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{
          color: '#fff',
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          🔐 Acceso al Dashboard
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#ecf0f1',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Contraseña:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Ingresa la contraseña"
              style={{
                width: '100%',
                padding: '12px 15px',
                fontSize: '16px',
                border: error ? '2px solid #e74c3c' : '2px solid #7f8c8d',
                borderRadius: '6px',
                backgroundColor: '#2c3e50',
                color: '#fff',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3498db'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = error ? '#e74c3c' : '#7f8c8d'
              }}
              autoFocus
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(231, 76, 60, 0.2)',
              border: '2px solid #e74c3c',
              color: '#e74c3c',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: '#27ae60',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#229954'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#27ae60'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(39, 174, 96, 0.3)'
            }}
          >
            Entrar al Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}

export default DashboardLogin


