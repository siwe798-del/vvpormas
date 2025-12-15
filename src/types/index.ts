export interface User {
  idUsuario: number
  nombreUsuario: string
  idSesion: string
  esValido: boolean
}

export interface Captcha {
  captcha: string
  [key: string]: any
}

export interface AppConfig {
  name: string
  app: string
  images: string
  api?: string
  ipServer?: string
  pathApp?: string
}

export interface ConfigData {
  ipServer: string
  pathApp: string
  [key: string]: any
}




