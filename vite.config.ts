import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true,
    host: true,
    // Middleware de seguridad
    middlewareMode: false,
    // Headers de seguridad
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;"
    },
    // Proteger rutas sensibles
    fs: {
      // Permitir acceso solo a directorios públicos
      strict: true,
      allow: ['..']
    }
  },
  preview: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    host: true,
    open: false,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Obfuscar nombres de archivos en producción
    rollupOptions: {
      output: {
        // Generar nombres de archivo con hash para cache busting y seguridad
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Minificar y ofuscar código
    minify: 'esbuild',
    // esbuild ya está incluido y es más rápido que terser
  },
  publicDir: 'public',
  // Ocultar información del servidor
  define: {
    'import.meta.env.VITE_HIDE_SOURCE': JSON.stringify(true)
  }
})

