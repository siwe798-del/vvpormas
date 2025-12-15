/**
 * Middleware de seguridad para el servidor WebSocket
 * Protege contra acceso no autorizado y scraping
 */

const securityMiddleware = {
  /**
   * Verifica si una petición es sospechosa
   */
  isSuspiciousRequest(req) {
    const userAgent = req.headers['user-agent'] || ''
    const referer = req.headers['referer'] || req.headers['referrer'] || ''
    const path = req.url || ''

    // Patrones sospechosos en User-Agent
    const suspiciousUserAgents = [
      'scrapy',
      'beautifulsoup',
      'selenium',
      'puppeteer',
      'playwright',
      'headless',
      'phantomjs',
      'curl',
      'wget',
      'python-requests',
      'axios',
      'node-fetch',
      'httpie',
      'postman',
      'insomnia',
      'rest-client'
    ]

    const isSuspiciousUA = suspiciousUserAgents.some(pattern =>
      userAgent.toLowerCase().includes(pattern.toLowerCase())
    )

    // Rutas protegidas
    const protectedPaths = [
      '/assets/',
      '/src/',
      '/node_modules/',
      '/.env',
      '/package.json',
      '/vite.config',
      '/tsconfig.json',
      '/.git/',
      '/api/',
      '/admin/',
      '/config/',
      '/database/',
      '/server/',
      '/websocket'
    ]

    const isProtectedPath = protectedPaths.some(pattern =>
      path.toLowerCase().includes(pattern.toLowerCase())
    )

    // Verificar referer (debe venir del mismo origen o ser vacío para assets)
    const origin = req.headers['origin'] || ''
    const isSameOrigin = origin === '' || origin.includes(req.headers['host'] || '')
    const hasValidReferer = referer === '' || referer.includes(req.headers['host'] || '')

    return isSuspiciousUA || (isProtectedPath && (!isSameOrigin || !hasValidReferer))
  },

  /**
   * Headers de seguridad
   */
  getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;",
      'X-Robots-Tag': 'noindex, nofollow'
    }
  },

  /**
   * Middleware para aplicar seguridad
   */
  applySecurity(req, res, next) {
    // Aplicar headers de seguridad
    const headers = this.getSecurityHeaders()
    Object.keys(headers).forEach(key => {
      res.setHeader(key, headers[key])
    })

    // Verificar rate limiting
    const clientIp = req.socket.remoteAddress || 'unknown'
    if (!this.checkRateLimit(clientIp, 100, 60000)) {
      console.warn(`[SECURITY] Rate limit excedido:`, {
        ip: clientIp,
        path: req.url
      })
      res.statusCode = 429
      res.setHeader('Content-Type', 'text/plain')
      res.end('Demasiadas peticiones. Intenta más tarde.')
      return
    }

    // Verificar si es petición sospechosa
    if (this.isSuspiciousRequest(req)) {
      console.warn(`[SECURITY] Petición sospechosa bloqueada:`, {
        ip: clientIp,
        userAgent: req.headers['user-agent'],
        path: req.url,
        referer: req.headers['referer'] || req.headers['referrer']
      })
      
      res.statusCode = 403
      res.setHeader('Content-Type', 'text/plain')
      res.end('Acceso denegado')
      return
    }

    // Continuar con la petición
    if (next) next()
  },

  /**
   * Rate limiting simple
   */
  rateLimit: new Map(),

  checkRateLimit(ip, maxRequests = 100, windowMs = 60000) {
    const now = Date.now()
    const key = `${ip}_${Math.floor(now / windowMs)}`
    
    const count = this.rateLimit.get(key) || 0
    
    if (count >= maxRequests) {
      return false
    }

    this.rateLimit.set(key, count + 1)
    
    // Limpiar entradas antiguas
    setTimeout(() => {
      this.rateLimit.delete(key)
    }, windowMs * 2)

    return true
  }
}

module.exports = securityMiddleware

