# Renombra archivos .tsx en src/components y src/contexts a PascalCase (solo primera letra)
$folders = @(".\src\components", ".\src\contexts")
foreach ($folder in $folders) {
    Get-ChildItem -Path $folder -Recurse -Filter *.tsx | ForEach-Object {
        $oldName = $_.Name
        if ($oldName -match "^[a-z]") {
            $baseName = $_.BaseName
            $pascalName = ($baseName.Substring(0,1).ToUpper() + $baseName.Substring(1)) + $_.Extension
            $newPath = Join-Path $_.DirectoryName $pascalName
            Rename-Item $_.FullName $newPath
            Write-Host "Renombrado: $oldName -> $pascalName"
        }
    }
}