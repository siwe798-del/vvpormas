import React from 'react'
import { Navigate } from 'react-router-dom'
import Dashboard from './Dashboard'

const DashboardProtected: React.FC = () => {
  // Verificar autenticación
  const isAuthenticated = sessionStorage.getItem('dashboard_authenticated') === 'true'
  const authTime = sessionStorage.getItem('dashboard_auth_time')
  
  // Verificar si la sesión expiró (24 horas)
  if (authTime) {
    const timeDiff = Date.now() - parseInt(authTime)
    const hoursDiff = timeDiff / (1000 * 60 * 60)
    if (hoursDiff > 24) {
      sessionStorage.removeItem('dashboard_authenticated')
      sessionStorage.removeItem('dashboard_auth_time')
      return <Navigate to="/dashboard/login" replace />
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/dashboard/login" replace />
  }

  return <Dashboard />
}

export default DashboardProtected


