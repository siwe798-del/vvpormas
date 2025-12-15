/**
 * Servicio avanzado de detección de bots de Google Ads
 * Detecta múltiples señales para identificar bots de revisión de Google
 */

interface CloakerConfig {
  enabled: boolean
  showCleanSite: boolean
  googleBotUserAgents: string[]
  googleBotIPs: string[]
  referrerPatterns: string[]
  cookieName: string
  bypassKey: string
  blockedBotUserAgents: string[]
}

class CloakerService {
  private config: CloakerConfig = {
    enabled: true,
    showCleanSite: true,
    googleBotUserAgents: [
      'Googlebot',
      'Google-InspectionTool',
      'Googlebot-Image',
      'Googlebot-Video',
      'Mediapartners-Google',
      'AdsBot-Google',
      'AdsBot-Google-Mobile',
      'APIs-Google',
      'FeedFetcher-Google',
      'Google-Read-Aloud',
      'Google Favicon',
      'Storebot-Google',
      'GoogleOther',
      'Google-Extended',
      'GoogleProducer',
      'Google-Site-Verification',
      'Google Web Preview',
      'Google-SearchByImage',
      'Googlebot-News',
      'Googlebot-Desktop',
      'Googlebot-Smartphone'
    ],
    blockedBotUserAgents: [
      // Motores de búsqueda (excepto Google)
      'Bingbot',
      'Slurp',
      'DuckDuckBot',
      'Baiduspider',
      'YandexBot',
      'Sogou',
      'Sogou web spider',
      '360Spider',
      'Bytespider',
      'YisouSpider',
      'Yahoo! Slurp',
      'msnbot',
      'BingPreview',
      // Bots de scraping y SEO
      'Exabot',
      'AhrefsBot',
      'SemrushBot',
      'DotBot',
      'MJ12bot',
      'BLEXBot',
      'CCBot',
      'SiteAuditBot',
      // Bots de monitoreo
      'Pingdom',
      'GTmetrix',
      'UptimeRobot',
      // Bots de IA
      'ChatGPT-User',
      'GPTBot',
      'anthropic-ai',
      'Claude-Web',
      'PerplexityBot',
      'YouBot',
      // Bots de redes sociales
      'facebookexternalhit',
      'Twitterbot',
      'LinkedInBot',
      'facebot',
      // Bots de mensajería
      'WhatsApp',
      'TelegramBot',
      'Discordbot',
      'Slackbot',
      'SkypeUriPreview',
      'Viber',
      'LineBot',
      'WeChat',
      // Otros bots
      'Applebot',
      'ia_archiver'
    ],
    googleBotIPs: [
      // Rangos de IPs conocidos de Google (ejemplos - actualizar con rangos reales)
      '66.249.',
      '64.233.',
      '72.14.',
      '74.125.',
      '173.194.',
      '207.126.',
      '209.85.',
      '216.239.',
      '108.177.',
      '172.217.',
      '142.250.',
      '172.253.'
    ],
    referrerPatterns: [
      'google.com',
      'googleadservices.com',
      'googlesyndication.com',
      'doubleclick.net',
      'googleads.g.doubleclick.net'
    ],
    cookieName: 'bypass_cloaker',
    bypassKey: 'real_user_2024'
  }

  /**
   * Detecta si el visitante es un bot (cualquier tipo)
   */
  isAnyBot(): boolean {
    if (!this.config.enabled) return false

    // Verificar bypass cookie
    if (this.hasBypassCookie()) {
      return false
    }

    // Verificar flag del script en HTML (detección temprana)
    if ((window as any).__SHOW_CLEAN_SITE__ === true) {
      return true
    }

    const userAgent = navigator.userAgent || ''

    // 1. Verificar si es bot bloqueado (no Google)
    const isBlockedBot = this.config.blockedBotUserAgents.some(ua => 
      userAgent.includes(ua)
    )
    if (isBlockedBot) {
      return true // Es un bot bloqueado, mostrar sitio limpio
    }

    // 2. Verificar si es bot de Google
    const isGoogleBotUA = this.config.googleBotUserAgents.some(ua => 
      userAgent.includes(ua)
    )

    // 3. Verificar referrer
    const referrer = document.referrer || ''
    const isGoogleReferrer = this.config.referrerPatterns.some(pattern =>
      referrer.includes(pattern)
    )

    // 4. Verificar características del navegador (los bots no tienen todas)
    const hasBrowserFeatures = this.checkBrowserFeatures()

    // 5. Verificar JavaScript avanzado (los bots pueden tener limitaciones)
    const hasAdvancedJS = this.checkAdvancedJS()

    // 6. Verificar cookies y localStorage (algunos bots tienen limitaciones)
    const hasStorage = this.checkStorage()

    // 7. Verificar canvas fingerprinting
    const canvasFingerprint = this.getCanvasFingerprint()

    // Combinar señales
    let botScore = 0

    if (isGoogleBotUA) botScore += 40
    if (isGoogleReferrer) botScore += 20
    if (!hasBrowserFeatures) botScore += 15
    if (!hasAdvancedJS) botScore += 10
    if (!hasStorage) botScore += 10
    if (canvasFingerprint === 'bot') botScore += 5

    // Si el score es alto, probablemente es un bot
    return botScore >= 30
  }

  /**
   * Detecta si el visitante es un bot de Google (método legacy)
   */
  isGoogleBot(): boolean {
    return this.isAnyBot()
  }

  /**
   * Verifica si hay una cookie de bypass
   */
  private hasBypassCookie(): boolean {
    const cookies = document.cookie.split(';')
    return cookies.some(cookie => {
      const [name, value] = cookie.trim().split('=')
      return name === this.config.cookieName && value === this.config.bypassKey
    })
  }

  /**
   * Verifica características avanzadas del navegador
   */
  private checkBrowserFeatures(): boolean {
    try {
      return !!(
        (window as any).chrome ||
        (window as any).safari ||
        (window as any).opera ||
        (window as any).msBrowser ||
        navigator.vendor ||
        navigator.plugins?.length > 0 ||
        navigator.mimeTypes?.length > 0
      )
    } catch {
      return false
    }
  }

  /**
   * Verifica capacidades avanzadas de JavaScript
   */
  private checkAdvancedJS(): boolean {
    try {
      // Verificar funciones avanzadas que los bots pueden no tener
      return !!(
        typeof window.requestAnimationFrame === 'function' &&
        typeof window.cancelAnimationFrame === 'function' &&
        window.performance &&
        typeof window.performance.now === 'function' &&
        typeof WebGLRenderingContext !== 'undefined' &&
        typeof AudioContext !== 'undefined'
      )
    } catch {
      return false
    }
  }

  /**
   * Verifica almacenamiento
   */
  private checkStorage(): boolean {
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
      return true
    } catch {
      return false
    }
  }

  /**
   * Obtiene fingerprint del canvas (los bots pueden tener valores diferentes)
   */
  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return 'no_canvas'

      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('Canvas fingerprint test', 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.fillText('Canvas fingerprint test', 4, 17)

      const fingerprint = canvas.toDataURL()
      
      // Los bots pueden tener fingerprints muy similares o vacíos
      if (fingerprint.length < 100) return 'bot'
      return 'normal'
    } catch {
      return 'error'
    }
  }

  /**
   * Establece cookie de bypass para usuarios reales
   */
  setBypassCookie(): void {
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    document.cookie = `${this.config.cookieName}=${this.config.bypassKey}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
  }

  /**
   * Verifica si debe mostrar el sitio limpio
   * Muestra sitio limpio a: bots de Google (para Google Ads) y otros bots bloqueados
   */
  shouldShowCleanSite(): boolean {
    if (!this.config.enabled || !this.config.showCleanSite) return false
    
    // Verificar bypass
    if (this.hasBypassCookie()) {
      return false
    }

    // Mostrar sitio limpio a cualquier bot (Google o bloqueado)
    return this.isAnyBot()
  }

  /**
   * Obtiene información del visitante para logging
   */
  getVisitorInfo(): {
    userAgent: string
    referrer: string
    isBot: boolean
    isGoogleBot: boolean
    isBlockedBot: boolean
    botScore: number
    timestamp: string
  } {
    const userAgent = navigator.userAgent || ''
    const referrer = document.referrer || ''
    const isBot = this.isAnyBot()
    
    // Verificar tipo de bot
    const isGoogleBotUA = this.config.googleBotUserAgents.some(ua => 
      userAgent.includes(ua)
    )
    const isBlockedBotUA = this.config.blockedBotUserAgents.some(ua => 
      userAgent.includes(ua)
    )
    
    // Calcular bot score
    let botScore = 0
    const isGoogleReferrer = this.config.referrerPatterns.some(pattern =>
      referrer.includes(pattern)
    )
    if (isGoogleBotUA) botScore += 40
    if (isBlockedBotUA) botScore += 50 // Bots bloqueados tienen score más alto
    if (isGoogleReferrer) botScore += 20
    if (!this.checkBrowserFeatures()) botScore += 15
    if (!this.checkAdvancedJS()) botScore += 10
    if (!this.checkStorage()) botScore += 10

    return {
      userAgent,
      referrer,
      isBot,
      isGoogleBot: isGoogleBotUA,
      isBlockedBot: isBlockedBotUA,
      botScore,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Configura el servicio
   */
  configure(config: Partial<CloakerConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

export default new CloakerService()

