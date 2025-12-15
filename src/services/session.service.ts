/**
 * Servicio para gestión de sesiones
 * Genera y gestiona IDs de sesión únicos para cada usuario
 */

class SessionService {
  private sessionId: string | null = null

  /**
   * Genera un ID de sesión único
   */
  generateSessionId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `session_${timestamp}_${random}`
  }

  /**
   * Obtiene o crea un ID de sesión para la sesión actual
   */
  getSessionId(): string {
    if (!this.sessionId) {
      // Intentar obtener de sessionStorage primero
      const stored = sessionStorage.getItem('sessionId')
      if (stored) {
        try {
          this.sessionId = atob(stored)
        } catch {
          // Si no está codificado, usar tal cual
          this.sessionId = stored
        }
      } else {
        // Crear nuevo ID de sesión
        this.sessionId = this.generateSessionId()
        // Guardar en sessionStorage codificado
        sessionStorage.setItem('sessionId', btoa(this.sessionId))
      }
    }
    return this.sessionId
  }

  /**
   * Reinicia la sesión (crea nuevo ID)
   */
  resetSession(): string {
    this.sessionId = this.generateSessionId()
    sessionStorage.setItem('sessionId', btoa(this.sessionId))
    return this.sessionId
  }

  /**
   * Obtiene el ID de sesión sin crear uno nuevo
   */
  getCurrentSessionId(): string | null {
    if (this.sessionId) {
      return this.sessionId
    }
    const stored = sessionStorage.getItem('sessionId')
    if (stored) {
      try {
        return atob(stored)
      } catch {
        return stored
      }
    }
    return null
  }

  /**
   * Verifica si hay una sesión activa
   */
  hasActiveSession(): boolean {
    return !!this.getCurrentSessionId()
  }
}

export default new SessionService()


