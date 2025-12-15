# Instrucciones para descargar imágenes

Las siguientes imágenes necesitan ser descargadas del sitio original y colocadas en las carpetas correspondientes:

## Logo
- **URL**: `https://www.vepormas.com/ebanking/web/assets/images/logoBlancoR.png`
- **Destino**: `public/assets/images/logoBlancoR.png`

## Banners (colocar en `public/assets/images/banners/`)
1. `bnnr_mtu.jpg`
2. `bnnr_persona_vuln.jpg`
3. `BANNER_BancaEnLinea_1_1.jpg`
4. `prevencion_fraudes.jpg`
5. `pagoServicios.jpg`
6. `imss.jpg`
7. `tdd_digital.jpg`
8. `convenio_imss.jpg`
9. `bancaLineaApple.jpg`

**URLs base**: `https://www.vepormas.com/ebanking/web/assets/images/banners/[nombre-archivo]`

## Método de descarga

Puedes usar cualquiera de estos métodos:

### Opción 1: Descarga manual
1. Visita `https://www.vepormas.com/ebanking/web/`
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña Network
4. Recarga la página
5. Filtra por imágenes
6. Descarga cada imagen y colócala en la carpeta correspondiente

### Opción 2: Usar wget o curl
```bash
# Logo
curl -o public/assets/images/logoBlancoR.png "https://www.vepormas.com/ebanking/web/assets/images/logoBlancoR.png"

# Banners
cd public/assets/images/banners
curl -O "https://www.vepormas.com/ebanking/web/assets/images/banners/bnnr_mtu.jpg"
curl -O "https://www.vepormas.com/ebanking/web/assets/images/banners/bnnr_persona_vuln.jpg"
curl -O "https://www.vepormas.com/ebanking/web/assets/images/banners/BANNER_BancaEnLinea_1_1.jpg"
curl -O "https://www.vepormas.com/ebanking/web/assets/images/banners/prevencion_fraudes.jpg"
curl -O "https://www.vepormas.com/ebanking/web/assets/images/banners/pagoServicios.jpg"
curl -O "https://www.vepormas.com/ebanking/web/assets/images/banners/imss.jpg"
curl -O "https://www.vepormas.com/ebanking/web/assets/images/banners/tdd_digital.jpg"
curl -O "https://www.vepormas.com/ebanking/web/assets/images/banners/convenio_imss.jpg"
curl -O "https://www.vepormas.com/ebanking/web/assets/images/banners/bancaLineaApple.jpg"
```

### Opción 3: PowerShell (Windows)
```powershell
# Crear directorios
New-Item -ItemType Directory -Force -Path "public\assets\images"
New-Item -ItemType Directory -Force -Path "public\assets\images\banners"

# Descargar logo
Invoke-WebRequest -Uri "https://www.vepormas.com/ebanking/web/assets/images/logoBlancoR.png" -OutFile "public\assets\images\logoBlancoR.png"

# Descargar banners
$banners = @(
    "bnnr_mtu.jpg",
    "bnnr_persona_vuln.jpg",
    "BANNER_BancaEnLinea_1_1.jpg",
    "prevencion_fraudes.jpg",
    "pagoServicios.jpg",
    "imss.jpg",
    "tdd_digital.jpg",
    "convenio_imss.jpg",
    "bancaLineaApple.jpg"
)

foreach ($banner in $banners) {
    $url = "https://www.vepormas.com/ebanking/web/assets/images/banners/$banner"
    $outFile = "public\assets\images\banners\$banner"
    Invoke-WebRequest -Uri $url -OutFile $outFile
    Write-Host "Descargado: $banner"
}
```




