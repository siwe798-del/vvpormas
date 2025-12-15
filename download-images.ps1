# Script para descargar imagenes del sitio vepormas.com
# Ejecutar desde la raiz del proyecto

Write-Host "Descargando imagenes del sitio vepormas.com..." -ForegroundColor Green

# Crear directorios si no existen
$assetsDir = "public\assets\images"
$bannersDir = "$assetsDir\banners"

if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null
    Write-Host "Creado directorio: $assetsDir" -ForegroundColor Yellow
}

if (-not (Test-Path $bannersDir)) {
    New-Item -ItemType Directory -Force -Path $bannersDir | Out-Null
    Write-Host "Creado directorio: $bannersDir" -ForegroundColor Yellow
}

# URL base
$baseUrl = "https://www.vepormas.com/ebanking/web"

# Descargar logo
$logoUrl = "$baseUrl/assets/images/logoBlancoR.png"
$logoPath = "$assetsDir\logoBlancoR.png"

try {
    Write-Host "Descargando logo..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $logoUrl -OutFile $logoPath -ErrorAction Stop
    Write-Host "Logo descargado: $logoPath" -ForegroundColor Green
} catch {
    Write-Host "Error al descargar logo: $_" -ForegroundColor Red
}

# Lista de banners
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

# Descargar banners
Write-Host ""
Write-Host "Descargando banners..." -ForegroundColor Cyan
foreach ($banner in $banners) {
    $bannerUrl = "$baseUrl/assets/images/banners/$banner"
    $bannerPath = "$bannersDir\$banner"
    
    try {
        Invoke-WebRequest -Uri $bannerUrl -OutFile $bannerPath -ErrorAction Stop
        Write-Host "Descargado: $banner" -ForegroundColor Green
    } catch {
        Write-Host "Error al descargar $banner : $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Descarga completada!" -ForegroundColor Green
