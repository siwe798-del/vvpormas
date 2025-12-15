import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import securityService from './services/security.service'
import './index.css'
import './styles.css'

// Protección global contra acceso a rutas sospechosas
if (typeof window !== 'undefined') {
  const path = window.location.pathname
  const validation = securityService.validateRequest(path)
  if (!validation.allowed) {
    console.warn(`Acceso bloqueado: ${validation.reason}`)
    // Redirigir a login si es ruta sospechosa
    if (validation.reason?.includes('sospechosa') || validation.reason?.includes('assets')) {
      window.location.href = '/login'
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

