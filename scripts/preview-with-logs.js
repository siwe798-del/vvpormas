import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

// Obtener puerto del WebSocket
function getWebSocketPort() {
  return process.env.WS_PORT || 3002;
}

function showDeployInfo() {
  const appPort = getPortFromConfig();
  const wsPort = getWebSocketPort();

  // Esperar un momento para que Vite inicie
  setTimeout(() => {
    console.log('');
    console.log('='.repeat(60));
    console.log('✨ SERVIDOR DE PREVIEW INICIADO');
    console.log('='.repeat(60));
    console.log('');
    console.log('📡 Servicios disponibles en los siguientes puertos:');
    console.log('');
    console.log(`   🌐 Aplicación Frontend:`);
    console.log(`      http://localhost:${appPort}`);
    console.log(`      http://0.0.0.0:${appPort}`);
    console.log('');
    console.log(`   🔌 Servidor WebSocket (si está corriendo):`);
    console.log(`      ws://localhost:${wsPort}`);
    console.log(`      ws://0.0.0.0:${wsPort}`);
    console.log('');
    console.log('='.repeat(60));
    console.log('');
    console.log('💡 Para iniciar el servidor WebSocket en otra terminal:');
    console.log('   npm run ws');
    console.log('');
  }, 2000);
}

// Iniciar vite preview
const vitePreview = spawn('npm', ['run', 'preview'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

// Mostrar información después de iniciar
showDeployInfo();

// Manejar cierre del proceso
vitePreview.on('close', (code) => {
  process.exit(code);
});

