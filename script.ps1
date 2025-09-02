# Buscar TODAS las páginas en tu proyecto
Write-Host "Buscando todas las páginas admin..." -ForegroundColor Cyan

# Buscar páginas que contengan "admin" en la ruta
Get-ChildItem -Path "src/app" -Recurse -Include "page.tsx" | Where-Object {
    $_.FullName -like "*admin*"
} | ForEach-Object {
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host "  $relativePath" -ForegroundColor White
}

Write-Host "`nBuscando TODAS las páginas del proyecto..." -ForegroundColor Cyan
Get-ChildItem -Path "src/app" -Recurse -Include "page.tsx" | ForEach-Object {
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host "  $relativePath" -ForegroundColor White
}
