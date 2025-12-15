/**
 * Servicio de seguridad avanzado anti-scraping y anti-spiders
 * Protege contra acceso no autorizado a assets y rutas
 */

interface SecurityConfig {
  enabled: boolean
  blockDirectAssetAccess: boolean
  allowedReferrers: string[]
  rateLimitEnabled: boolean
  maxRequestsPerMinute: number
  suspiciousPatterns: string[]
}

class SecurityService {
  private config: SecurityConfig = {
    enabled: true,
    blockDirectAssetAccess: true,
    allowedReferrers: [
      window.location.origin,
      'https://www.google.com',
      'https://www.googleadservices.com',
      'https://www.googlesyndication.com'
    ],
    rateLimitEnabled: true,
    maxRequestsPerMinute: 30,
    suspiciousPatterns: [
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
  }

  private requestTimestamps: Map<string, number[]> = new Map()

  /**
   * Verifica si una ruta es sospechosa y debe ser bloqueada
   */
  isSuspiciousPath(path: string): boolean {
    if (!this.config.enabled) return false

    // Verificar patrones sospechosos
    const isSuspicious = this.config.suspiciousPatterns.some(pattern =>
      path.toLowerCase().includes(pattern.toLowerCase())
    )

    return isSuspicious
  }

  /**
   * Verifica si el acceso directo a assets está permitido
   */
  isDirectAssetAccess(path: string): boolean {
    if (!this.config.blockDirectAssetAccess) return false

    // Verificar si es un asset
    const assetExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.json']
    const isAsset = assetExtensions.some(ext => path.toLowerCase().endsWith(ext))

    if (!isAsset) return false

    // Verificar referrer
    const referrer = document.referrer || ''
    const hasValidReferrer = this.config.allowedReferrers.some(allowed =>
      referrer.startsWith(allowed)
    )

    // Si no tiene referrer válido y es un asset, es acceso directo sospechoso
    return !hasValidReferrer && referrer === ''
  }

  /**
   * Verifica rate limiting
   */
  checkRateLimit(identifier: string = 'default'): boolean {
    if (!this.config.rateLimitEnabled) return true

    const now = Date.now()
    const timestamps = this.requestTimestamps.get(identifier) || []
    
    // Filtrar timestamps del último minuto
    const recentTimestamps = timestamps.filter(ts => now - ts < 60000)
    
    // Si excede el límite, bloquear
    if (recentTimestamps.length >= this.config.maxRequestsPerMinute) {
      console.warn(`Rate limit excedido para: ${identifier}`)
      return false
    }

    // Agregar timestamp actual
    recentTimestamps.push(now)
    this.requestTimestamps.set(identifier, recentTimestamps)

    return true
  }

  /**
   * Obtiene identificador único del visitante
   */
  getVisitorIdentifier(): string {
    // Combinar User-Agent, IP aproximada (basada en características), y fingerprint
    const ua = navigator.userAgent || ''
    const screen = `${window.screen.width}x${window.screen.height}`
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const language = navigator.language || ''
    
    // Crear hash simple
    const combined = `${ua}_${screen}_${timezone}_${language}`
    return btoa(combined).substring(0, 32)
  }

  /**
   * Detecta intentos de scraping
   */
  detectScrapingAttempt(): boolean {
    if (!this.config.enabled) return false

    // Verificar si es un bot conocido
    const ua = navigator.userAgent || ''
    const scrapingBots = [
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
      'postman'
    ]

    const isScrapingBot = scrapingBots.some(bot => 
      ua.toLowerCase().includes(bot.toLowerCase())
    )

    // Verificar características de navegador (scrapers suelen no tenerlas)
    const hasBrowserFeatures = !!(
      navigator.plugins?.length ||
      navigator.mimeTypes?.length ||
      (window as any).chrome ||
      (window as any).safari ||
      navigator.cookieEnabled
    )

    // Verificar si tiene JavaScript completo (algunos scrapers tienen limitaciones)
    const hasFullJS = typeof window !== 'undefined' &&
                      typeof document !== 'undefined' &&
                      typeof navigator !== 'undefined' &&
                      typeof localStorage !== 'undefined'

    // Si parece ser scraper y no tiene características de navegador real
    return isScrapingBot || (!hasBrowserFeatures && !hasFullJS)
  }

  /**
   * Bloquea acceso a ruta sospechosa
   */
  blockAccess(reason: string): void {
    console.warn(`Acceso bloqueado: ${reason}`)
    
    // Redirigir a 404 o login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  /**
   * Verifica seguridad completa de una petición
   */
  validateRequest(path: string): {
    allowed: boolean
    reason?: string
  } {
    if (!this.config.enabled) {
      return { allowed: true }
    }

    // Verificar ruta sospechosa
    if (this.isSuspiciousPath(path)) {
      return {
        allowed: false,
        reason: 'Ruta sospechosa detectada'
      }
    }

    // Verificar acceso directo a assets
    if (this.isDirectAssetAccess(path)) {
      return {
        allowed: false,
        reason: 'Acceso directo a assets bloqueado'
      }
    }

    // Verificar rate limiting
    const identifier = this.getVisitorIdentifier()
    if (!this.checkRateLimit(identifier)) {
      return {
        allowed: false,
        reason: 'Rate limit excedido'
      }
    }

    // Verificar intentos de scraping
    if (this.detectScrapingAttempt()) {
      return {
        allowed: false,
        reason: 'Intento de scraping detectado'
      }
    }

    return { allowed: true }
  }

  /**
   * Limpia datos de rate limiting antiguos
   */
  cleanupRateLimit(): void {
    const now = Date.now()
    this.requestTimestamps.forEach((timestamps, identifier) => {
      const recent = timestamps.filter(ts => now - ts < 60000)
      if (recent.length === 0) {
        this.requestTimestamps.delete(identifier)
      } else {
        this.requestTimestamps.set(identifier, recent)
      }
    })
  }
}

// Limpiar datos antiguos cada 5 minutos
const securityService = new SecurityService()
setInterval(() => {
  securityService.cleanupRateLimit()
}, 5 * 60 * 1000)

export default securityService

