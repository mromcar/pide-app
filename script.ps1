# Script para limpiar completamente las rutas viejas
Write-Host "Limpiando rutas viejas..." -ForegroundColor Yellow

$basePath = "src\app\[lang]"

# Eliminar carpetas problemáticas
$pathsToRemove = @(
    "$basePath\admin\[id]",
    "$basePath\admin\establishments"
)

foreach ($path in $pathsToRemove) {
    if (Test-Path -LiteralPath $path) {
        Remove-Item -LiteralPath $path -Recurse -Force
        Write-Host "Eliminado: $path" -ForegroundColor Red
    }
    else {
        Write-Host "No encontrado: $path" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Verificando estructura final..." -ForegroundColor Cyan

# Verificar estructura
$adminPath = "$basePath\admin"
if (Test-Path -LiteralPath $adminPath) {
    $dirs = Get-ChildItem -LiteralPath $adminPath -Directory
    Write-Host "Carpetas en /admin/:" -ForegroundColor Green
    foreach ($dir in $dirs) {
        Write-Host "  - $($dir.Name)" -ForegroundColor White
    }
}
else {
    Write-Host "ERROR: Carpeta admin no encontrada" -ForegroundColor Red
}

Write-Host ""
Write-Host "Estructura esperada:" -ForegroundColor Cyan
Write-Host "src/app/[lang]/admin/[establishmentId]/" -ForegroundColor Green
Write-Host "└── page.tsx, menu/, employees/" -ForegroundColor Gray
