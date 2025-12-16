import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Leer configuración de vite.config.ts para obtener el puerto
function getPortFromConfig() {
  try {
    const viteConfigPath = join(rootDir, 'vite.config.ts');
    const configContent = readFileSync(viteConfigPath, 'utf-8');
    
    // Buscar el puerto en la configuración de preview (más flexible)
    const portMatch = configContent.match(/preview:\s*\{[\s\S]*?port:\s*(?:process\.env\.PORT\s*\?\s*parseInt\(process\.env\.PORT\)\s*:\s*)?(\d+)/);
    if (portMatch) {
      return portMatch[1];
    }
    
    // Si no encuentra, usar el puerto por defecto de Vite
    return process.env.PORT || 4173;
  } catch (error) {
    return process.env.PORT || 4173;
  }
}

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
  return '80';
}

// Obtener puerto del WebSocket
function getWebSocketPort() {
  return process.env.WS_PORT || 3002;
}

async function deploy() {
  console.log('');
  console.log('='.repeat(60));
  console.log('🚀 Iniciando proceso de deploy...');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Paso 1: Build
    console.log('📦 Compilando aplicación para producción...');
    console.log('');
    
    const { stdout: buildStdout, stderr: buildStderr } = await execAsync('npm run build', {
      cwd: rootDir,
      encoding: 'utf-8'
    });
    
    if (buildStderr && !buildStderr.includes('warning')) {
      console.error('⚠️  Advertencias durante el build:', buildStderr);
    }
    
    console.log('✅ Build completado exitosamente');
    console.log('');

    // Obtener puertos
    const appPort = getPortFromConfig();
    const caddyPort = getCaddyPort();
    const wsPort = getWebSocketPort();

    // Paso 2: Mostrar información de deploy
    console.log('');
    console.log('='.repeat(60));
    console.log('✨ DEPLOY COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('');
    console.log('📡 Servicios disponibles en los siguientes puertos:');
    console.log('');
    console.log(`   🌐 Servidor Caddy (HTTP):`);
    console.log(`      http://localhost:${caddyPort}`);
    console.log(`      http://0.0.0.0:${caddyPort}`);
    console.log('');
    console.log(`   🚀 Aplicación Frontend (Vite Preview):`);
    console.log(`      http://localhost:${appPort}`);
    console.log(`      http://0.0.0.0:${appPort}`);
    console.log('');
    console.log(`   🔌 Servidor WebSocket:`);
    console.log(`      ws://localhost:${wsPort}`);
    console.log(`      ws://0.0.0.0:${wsPort}`);
    console.log('');
    console.log('='.repeat(60));
    console.log('');
    console.log('💡 Para iniciar Caddy con logs de puertos, ejecuta:');
    console.log('   npm run caddy:logs');
    console.log('');
    console.log('💡 O si ya tienes Caddy corriendo, ejecuta:');
    console.log('   npm run ports');
    console.log('');
    console.log('💡 Para iniciar el servidor de preview, ejecuta:');
    console.log('   npm run preview');
    console.log('');
    console.log('💡 Para iniciar el servidor WebSocket, ejecuta:');
    console.log('   npm run ws');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ ERROR durante el deploy');
    console.error('='.repeat(60));
    console.error('');
    console.error('Detalles del error:');
    console.error(error.message);
    if (error.stdout) console.error('Salida:', error.stdout);
    if (error.stderr) console.error('Errores:', error.stderr);
    console.error('');
    process.exit(1);
  }
}

deploy();

