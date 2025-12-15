/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WS_URL?: string
  // más variables de entorno aquí
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

