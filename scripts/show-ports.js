import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Detectar puerto de Caddy
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
  // Basado en los logs del usuario que muestran ":80"
  return '80';
}

// Obtener puerto del WebSocket
function getWebSocketPort() {
  return process.env.WS_PORT || 3002;
}

// Función principal
function showPorts() {
  const caddyPort = getCaddyPort();
  const wsPort = getWebSocketPort();

  console.log('');
  console.log('='.repeat(60));
  console.log('📡 INFORMACIÓN DE PUERTOS DEL SERVIDOR');
  console.log('='.repeat(60));
  console.log('');
  console.log('Servicios disponibles en los siguientes puertos:');
  console.log('');
  console.log(`   🌐 Servidor Caddy (HTTP):`);
  console.log(`      http://localhost:${caddyPort}`);
  console.log(`      http://0.0.0.0:${caddyPort}`);
  console.log('');
  console.log(`   🔌 Servidor WebSocket:`);
  console.log(`      ws://localhost:${wsPort}`);
  console.log(`      ws://0.0.0.0:${wsPort}`);
  console.log('');
  console.log('='.repeat(60));
  console.log('');
}

showPorts();


