<#
.SYNOPSIS
    PowerShell launcher for Qwen with .env auto-load and API key validation.
    Run from the project folder: .\run_qwen.ps1 --project money-transfer-app --inspect
#>

# --- Auto-load .env variables ---
$envFile = Join-Path (Get-Location) ".env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*#") { return } # skip comments
        $name, $value = $_ -split '=', 2
        $name = $name.Trim()
        $value = $value.Trim()
        if ($name) {
            ${env:$name} = $value
        }
    }
    Write-Host "✅ Loaded .env variables (PowerShell)"
}
else {
    Write-Host "⚠ No .env file found in $((Get-Location).Path)"
}

# --- Fail-safe check for OPENROUTER_API_KEY ---
if (-not $env:OPENROUTER_API_KEY -or $env:OPENROUTER_API_KEY -match '^\s|\s$') {
    Write-Host "❌ OPENROUTER_API_KEY is missing or has spaces. Please fix .env."
    exit 1
}

# --- Run Qwen with passed arguments ---
# Change 'qwen' below if your executable/alias is different
$qwenExecutable = "qwen"

& $qwenExecutable @args
