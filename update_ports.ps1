# Scan and update all files to use backend port 4002

$projectRoot = "C:\Users\great\Documents\AI_Projects\Travel-Car&Hotel-Reservation-App"
$oldPorts = @("4000", "4001")
$newPort = "4002"

# 1. Update .env file
$envFile = Join-Path $projectRoot ".env"
if (Test-Path $envFile) {
    (Get-Content $envFile) -replace "PORT=\d+", "PORT=$newPort" | Set-Content $envFile
    Write-Host "✅ Updated backend port in .env"
}

# 2. Update setupProxy.js in frontend/src
$proxyFile = Join-Path $projectRoot "frontend\src\setupProxy.js"
if (Test-Path $proxyFile) {
    (Get-Content $proxyFile) -replace "localhost:(4000|4001)", "localhost:$newPort" | Set-Content $proxyFile
    Write-Host "✅ Updated proxy target in setupProxy.js"
}

# 3. Scan all .js and .json files for old port references and update
$files = Get-ChildItem -Path $projectRoot -Recurse -Include *.js, *.json
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $updated = $false
    foreach ($oldPort in $oldPorts) {
        if ($content -match $oldPort) {
            $content = $content -replace $oldPort, $newPort
            $updated = $true
        }
    }
    if ($updated) {
        $content | Set-Content $file.FullName
        Write-Host "✅ Updated port in $($file.FullName)"
    }
}

Write-Host "🚀 All files scanned and updated to use backend port $newPort."