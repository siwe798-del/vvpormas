import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Función para detectar el puerto de Caddy desde el Caddyfile o logs
function getCaddyPort() {
  // Intentar leer desde variable de entorno
  if (process.env.CADDY_PORT) {
    return process.env.CADDY_PORT;
  }

  // Buscar Caddyfile en diferentes ubicaciones
  const possibleCaddyfiles = [
    join(rootDir, 'Caddyfile'),
    join(rootDir, '/Caddyfile'),
    '/Caddyfile',
    '/etc/caddy/Caddyfile'
  ];

  for (const caddyfilePath of possibleCaddyfiles) {
    if (existsSync(caddyfilePath)) {
      try {
        const content = readFileSync(caddyfilePath, 'utf-8');
        // Buscar puerto en formato :80, :8080, etc.
        const portMatch = content.match(/:(\d+)/);
        if (portMatch) {
          return portMatch[1];
        }
        // Buscar en formato "http://localhost:80"
        const httpMatch = content.match(/http:\/\/[^:]+:(\d+)/);
        if (httpMatch) {
          return httpMatch[1];
        }
      } catch (error) {
        // Continuar buscando
      }
    }
  }

  // Puerto por defecto de Caddy cuando no hay TLS (HTTP)
  return process.env.PORT || '80';
}

// Obtener puerto del WebSocket
function getWebSocketPort() {
  return process.env.WS_PORT || 3002;
}

function showDeployInfo(caddyPort) {
  const wsPort = getWebSocketPort();

  // Mostrar información inmediatamente y luego después de que Caddy inicie
  console.log('');
  console.log('='.repeat(60));
  console.log('🚀 Iniciando Caddy...');
  console.log('='.repeat(60));
  console.log('');

  // Esperar un momento para que Caddy inicie completamente
  setTimeout(() => {
    console.log('');
    console.log('');
    console.log('='.repeat(60));
    console.log('✨ CADDY SERVIDOR INICIADO EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('');
    console.log('📡 Servicios disponibles en los siguientes puertos:');
    console.log('');
    console.log(`   🌐 Servidor Caddy (HTTP):`);
    console.log(`      http://localhost:${caddyPort}`);
    console.log(`      http://0.0.0.0:${caddyPort}`);
    console.log('');
    console.log(`   🔌 Servidor WebSocket (si está corriendo):`);
    console.log(`      ws://localhost:${wsPort}`);
    console.log(`      ws://0.0.0.0:${wsPort}`);
    console.log('');
    console.log('='.repeat(60));
    console.log('');
    console.log('💡 Para ver los puertos en cualquier momento, ejecuta:');
    console.log('   npm run ports');
    console.log('');
    console.log('💡 Para iniciar el servidor WebSocket en otra terminal:');
    console.log('   npm run ws');
    console.log('');
  }, 2000);
}

// Obtener el puerto de Caddy
const caddyPort = getCaddyPort();

// Obtener el comando de Caddy desde los argumentos o usar el por defecto
const caddyArgs = process.argv.slice(2);
if (caddyArgs.length === 0) {
  // Si no hay argumentos, usar el comando por defecto
  caddyArgs.push('run', '--config', '/Caddyfile');
}

// Iniciar Caddy
const caddyProcess = spawn('caddy', caddyArgs, {
  stdio: 'inherit',
  shell: false
});

// Mostrar información después de iniciar
showDeployInfo(caddyPort);

// Manejar cierre del proceso
caddyProcess.on('close', (code) => {
  process.exit(code);
});

caddyProcess.on('error', (error) => {
  console.error('❌ Error al iniciar Caddy:', error.message);
  console.error('');
  console.error('💡 Asegúrate de que Caddy esté instalado y en el PATH');
  process.exit(1);
});

