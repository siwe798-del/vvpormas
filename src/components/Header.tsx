import React from 'react'

const Header: React.FC = () => {
  const date = new Date()

  return (
    <header className="navbar navbar-default navbar-static-top" style={{ marginBottom: 0 }}>
      <div className="container-fluid">
        <div className="navbar-header">
          <a className="navbar-brand" href="#">
            Banca en Línea B×+
          </a>
        </div>
        <div className="navbar-text navbar-right" style={{ paddingRight: '15px' }}>
          {date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
    </header>
  )
}

export default Header

