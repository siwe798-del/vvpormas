import axios from 'axios'
import { ConfigData } from '../types'

class ConfigService {
  private config: ConfigData | null = null

  async getConfig(): Promise<ConfigData> {
    if (this.config) {
      return this.config
    }

    const hostname = window.location.hostname
    const port = window.location.port
    const protocol = window.location.protocol
    let pathRelative = ''

    if (hostname === 'localhost' || hostname.indexOf('192.168.') !== -1) {
      pathRelative = ''
    } else {
      pathRelative = '/ebanking'
    }

    try {
      const response = await axios.get<ConfigData>(
        '/config.json?v=' + Date.now(),
        { headers: { 'Cache-Control': 'no-cache' } }
      )

      const data = response.data

      if (!data || Object.keys(data).length === 0) {
        throw new Error('El archivo de configuración se encuentra vacío.')
      }

      if (!('ipServer' in data) || !data.ipServer || String(data.ipServer).replace(/^\s+|\s+$/g, '').length === 0) {
        throw new Error('El atributo ipServer en el archivo de configuración se encuentra vacío.')
      }

      let host = hostname
      if (port) {
        host = host + ':' + port
      }

      const configData: ConfigData = {
        ...data,
        ipServer: data.ipServer || '',
        pathApp: protocol + '//' + host + pathRelative
      }

      if (!sessionStorage.getItem('api')) {
        sessionStorage.setItem('api', btoa(JSON.stringify(configData)))
      }

      this.config = configData
      return configData
    } catch (error) {
      console.error('Error al obtener configuración:', error)
      throw error
    }
  }

  isDev(): boolean {
    const hostname = window.location.hostname
    return hostname === 'localhost' || hostname.indexOf('192.168.') !== -1
  }

  existMachine(machine: string): boolean {
    const apiStr = sessionStorage.getItem('api')
    if (!apiStr) return false

    try {
      const api = JSON.parse(atob(apiStr))
      return !!api[machine]
    } catch {
      return false
    }
  }
}

export default new ConfigService()

