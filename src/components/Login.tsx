import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api.service'
import { User } from '../types'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [verifyUser, setVerifyUser] = useState(false)
  const [sendService, setSendService] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendService(true)
    setVerifyUser(false)
    setErrorMessage('')

    if (!username || username.trim() === '') {
      setVerifyUser(true)
      setSendService(false)
      return
    }

    try {
      await apiService.initialize()
      const response = await apiService.post('loc01', { usuario: username })
      const usuario: User = response.data.data

      if (usuario.esValido === true) {
        sessionStorage.setItem('user', btoa(usuario.idUsuario.toString()))
        sessionStorage.setItem('realName', btoa(usuario.nombreUsuario))
        sessionStorage.setItem('idSesion', btoa(usuario.idSesion))
        sessionStorage.setItem('userName', btoa(username))
        
        await generateCaptcha()
      } else {
        setVerifyUser(true)
        setSendService(false)
      }
    } catch (error: any) {
      setVerifyUser(true)
      setSendService(false)
      setErrorMessage(error.response?.data?.data || 'Error al validar usuario')
    }
  }

  const generateCaptcha = async () => {
    try {
      const userName = atob(sessionStorage.getItem('userName') || '')
      const userId = parseInt(atob(sessionStorage.getItem('user') || '0'))
      const sessionId = atob(sessionStorage.getItem('idSesion') || '')

      const response = await apiService.post('lot10', {
        usuario: userName,
        idUsuario: userId,
        idSesion: sessionId
      })

      // Guardar captcha en sessionStorage o estado global
      sessionStorage.setItem('captcha', JSON.stringify(response.data.data))
      navigate('/password')
    } catch (error) {
      console.error('Error al generar captcha:', error)
      setErrorMessage('Error al generar captcha')
    }
  }

  const handleRecoverPassword = () => {
    sessionStorage.setItem('realName', btoa('Invitado'))
    const params = [
      'height=' + screen.height,
      'width=' + screen.width,
      'fullscreen=yes',
      'resizable=no',
      'scrollbars=yes',
      'toolbar=no',
      'menubar=no',
      'location=no',
      'titlebar=Omnisuite Banking'
    ].join(',')
    
    window.open(
      '../banking/#/login/recuperar-contrasena/recuperar-usuario',
      '_blank',
      params
    )?.moveTo(0, 0)
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-4 col-md-offset-4">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h2 className="panel-title">Iniciar Sesión</h2>
            </div>
            <div className="panel-body">
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="username">Usuario</label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`form-control ${verifyUser ? 'validation-invalid' : ''}`}
                    disabled={sendService}
                    placeholder="Ingrese su usuario"
                  />
                  {verifyUser && (
                    <span className="help-block text-danger">
                      {errorMessage || 'Usuario inválido'}
                    </span>
                  )}
                </div>
                <button 
                  type="submit" 
                  disabled={sendService} 
                  className="btn btn-primary btn-block"
                >
                  {sendService ? 'Validando...' : 'Continuar'}
                </button>
              </form>
              <button
                type="button"
                onClick={handleRecoverPassword}
                className="btn btn-link btn-block"
                style={{ marginTop: '10px' }}
              >
                Recuperar contraseña
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

