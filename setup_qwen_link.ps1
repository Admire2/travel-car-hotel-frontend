# setup_qwen_link.ps1
# Helper script to set up qwen for this project using your existing setup

param(
    [string]$SourcePath = "C:\Users\great\Documents\AI_Projects\money-transfer-app",
    [switch]$Search
)

Write-Host "Setting up Qwen for Travel-Car-Hotel-Reservation-App..." -ForegroundColor Cyan

if ($Search) {
    Write-Host "Searching for qwen files on your system..." -ForegroundColor Yellow
    
    # Search common locations
    $searchPaths = @(
        "C:\Users\great\Documents\AI_Projects\*",
        "C:\Users\great\AppData\Local\*",
        "C:\Users\great\AppData\Roaming\*",
        "C:\Program Files\*",
        "C:\tools\*"
    )
    
    foreach ($path in $searchPaths) {
        Write-Host "Searching in: $path" -ForegroundColor Gray
        Get-ChildItem -Path $path -Recurse -Name "*qwen*" -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "Found: $_" -ForegroundColor Green
        }
    }
    return
}

# List possible locations to check manually
Write-Host "Common qwen installation locations to check:" -ForegroundColor Cyan
Write-Host "1. C:\Users\great\Documents\AI_Projects\[project-name]\" -ForegroundColor Yellow
Write-Host "2. C:\Users\great\AppData\Local\Programs\" -ForegroundColor Yellow  
Write-Host "3. C:\Users\great\AppData\Roaming\npm\node_modules\" -ForegroundColor Yellow
Write-Host "4. Python Scripts folder" -ForegroundColor Yellow
Write-Host "" -ForegroundColor Gray
Write-Host "To search automatically, run: .\setup_qwen_link.ps1 -Search" -ForegroundColor Cyan
Write-Host "To specify path, run: .\setup_qwen_link.ps1 -SourcePath 'your\path\here'" -ForegroundColor Cyan

# Check if source qwen exists
$possibleFiles = @("qwen.exe", "qwen", "qwen.py", "run_qwen.ps1", "run_qwen")
$found = $false

foreach ($file in $possibleFiles) {
    $fullPath = Join-Path $SourcePath $file
    if (Test-Path $fullPath) {
        Write-Host "Found: $fullPath" -ForegroundColor Green
        $found = $true
        
        if ($file -eq "run_qwen.ps1" -or $file -eq "run_qwen") {
            Write-Host "This appears to be a script. Copying to current directory..." -ForegroundColor Yellow
            Copy-Item $fullPath ".\qwen_working_script" -Force
            Write-Host "Copied to: .\qwen_working_script" -ForegroundColor Green
        }
    }
}

if (-not $found) {
    Write-Host "Could not find qwen files at: $SourcePath" -ForegroundColor Red
    Write-Host "Please provide the correct source path where qwen works" -ForegroundColor Yellow
}