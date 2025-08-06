# Busca y reemplaza snake_case por camelCase en archivos .tsx y .ts

# Función para convertir snake_case a camelCase
function To-CamelCase($snake) {
    $parts = $snake -split '_'
    $parts[0] + ($parts[1..($parts.Length - 1)] | ForEach-Object { $_.Substring(0, 1).ToUpper() + $_.Substring(1) }) -join ''
}

# Buscar todos los archivos .tsx y .ts (excepto .d.ts)
$files = Get-ChildItem -Path . -Recurse -Include *.tsx, *.ts | Where-Object { $_.Name -notlike '*.d.ts' }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Buscar todas las palabras snake_case (no dentro de comillas)
    $content = $content -replace '(?<!["''])\b([a-z]+_[a-z0-9_]+)\b', {
        param($match)
        To-CamelCase $match.Groups[1].Value
    }

    Set-Content $file.FullName $content
    Write-Host "Procesado: $($file.FullName)"
}
