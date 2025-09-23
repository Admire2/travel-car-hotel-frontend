<#
.SYNOPSIS
    PowerShell launcher for Qwen with .env auto-load and free model support.
    Run from the project folder: .\run_qwen.ps1 -p "Inspect my database connection"

.PARAMETER m
    The model to use (default: qwen/qwen-2.5-coder-32b-instruct:free)

.PARAMETER p  
    The prompt/message to send to Qwen

.PARAMETER project
    Project context (default: travel-car-hotel-reservation-app)

.PARAMETER inspect
    Inspect database connections and configurations

.PARAMETER free
    Use free Qwen model via OpenRouter (rate limited but no API key required)

.PARAMETER local
    Use local Ollama installation (completely free, requires Ollama setup)

.EXAMPLE
    .\run_qwen.ps1 --free -p "Inspect my database connection"
    .\run_qwen.ps1 --local --inspect
    .\run_qwen.ps1 --free -p "Review the backend API structure"
    .\run_qwen.ps1 -m "qwen/qwen-2.5-coder-32b-instruct:free" -p "Analyze my code"
#>

param(
    [string]$m = "qwen/qwen-2.5-coder-32b-instruct:free",
    [string]$p = "",
    [string]$project = "travel-car-hotel-reservation-app",
    [switch]$inspect,
    [switch]$local,
    [switch]$free
)

# Set default prompt for database inspection
if ($inspect -and -not $p) {
    $p = "You are a fullstack engineer. Inspect the database connection configuration in this Travel-Car-Hotel-Reservation-App project. Review config/database.js, backend models, and suggest improvements for connection handling, error management, and performance."
}

# Handle free model selection
if ($free) {
    $m = "qwen/qwen-2.5-coder-32b-instruct:free"
    Write-Host "FREE: Using free Qwen model via OpenRouter" -ForegroundColor Green
}

if ($local) {
    $m = "qwen2.5-coder"
    Write-Host "LOCAL: Using local Ollama model" -ForegroundColor Cyan
    # Check if Ollama is running
    try {
        $null = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method GET -ErrorAction Stop
        Write-Host "SUCCESS: Ollama is running locally" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Ollama not detected. Install with: https://ollama.ai" -ForegroundColor Red
        Write-Host "Then run: ollama pull qwen2.5-coder" -ForegroundColor Yellow
        exit 1
    }
}

# --- Auto-load .env variables ---
$envFile = Join-Path (Get-Location) ".env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*#") { return } # skip comments
        if ($_ -match "^\s*$") { return } # skip empty lines
        $name, $value = $_ -split '=', 2
        $name = $name.Trim()
        $value = $value.Trim()
        if ($name) {
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "SUCCESS: Loaded .env variables (PowerShell)" -ForegroundColor Green
}
else {
    Write-Host "WARNING: No .env file found in $((Get-Location).Path)" -ForegroundColor Yellow
    Write-Host "Creating .env template..." -ForegroundColor Cyan
    $envTemplate = @"
# Travel-Car-Hotel-Reservation-App Environment Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
DB_HOST=localhost
DB_PORT=27017
DB_NAME=travel_reservation_db
DB_USER=
DB_PASSWORD=
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
PORT=5000
"@
    $envTemplate | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "TEMPLATE: Created .env template. Please configure your API keys and database settings." -ForegroundColor Cyan
}

# --- Fail-safe check for OPENROUTER_API_KEY (only if not using local) ---
if (-not $local) {
    if (-not $env:OPENROUTER_API_KEY -or $env:OPENROUTER_API_KEY -match '^\s|\s$' -or $env:OPENROUTER_API_KEY -eq "your_openrouter_api_key_here") {
        if ($free) {
            Write-Host "WARNING: OPENROUTER_API_KEY not configured. Free models have rate limits." -ForegroundColor Yellow
            Write-Host "For better performance, get a free API key from: https://openrouter.ai/keys" -ForegroundColor Yellow
            Write-Host "Continuing with limited free access..." -ForegroundColor Cyan
        }
        else {
            Write-Host "ERROR: OPENROUTER_API_KEY is missing, has spaces, or is a placeholder. Please configure .env with your actual API key." -ForegroundColor Red
            Write-Host "Get your API key from: https://openrouter.ai/keys" -ForegroundColor Yellow
            Write-Host "Or use --free flag for limited free access, or --local for Ollama" -ForegroundColor Cyan
            exit 1
        }
    }
}

# --- Validation ---
if (-not $p) {
    Write-Host "ERROR: No prompt provided. Use -p parameter or --inspect flag." -ForegroundColor Red
    Write-Host "Example: .\run_qwen.ps1 -p 'Inspect my database connection'" -ForegroundColor Yellow
    exit 1
}

# --- Display context info ---
Write-Host "RUNNING: Qwen for $project" -ForegroundColor Cyan
Write-Host "MODEL: $m" -ForegroundColor Gray
if ($free) {
    Write-Host "COST: FREE (rate limited)" -ForegroundColor Green
}
elseif ($local) {
    Write-Host "COST: FREE (local)" -ForegroundColor Green
}
else {
    Write-Host "COST: Paid API" -ForegroundColor Yellow
}
Write-Host "PROMPT: $p" -ForegroundColor Gray
Write-Host "DIRECTORY: $((Get-Location).Path)" -ForegroundColor Gray
Write-Host "----------------------------------------" -ForegroundColor Gray

# --- Run Qwen with passed arguments ---
# Try different qwen executables and methods
$qwenExecutables = @("qwen", "ollama", "C:\Users\great\Documents\AI_Projects\money-transfer-app\qwen.exe", "python -m qwen")

Write-Host "Attempting to run Qwen..." -ForegroundColor Cyan

$success = $false
foreach ($qwenExe in $qwenExecutables) {
    try {
        if ($qwenExe -eq "ollama") {
            Write-Host "Trying Ollama with qwen2.5-coder model..." -ForegroundColor Yellow
            & ollama run qwen2.5-coder $p
            $success = $true
            break
        }
        elseif ($qwenExe -like "*python*") {
            Write-Host "Trying Python qwen module..." -ForegroundColor Yellow
            & python -c "import subprocess; subprocess.run(['qwen', '-m', '$m', '-p', '$p', '--project', '$project'])"
            $success = $true
            break
        }
        else {
            Write-Host "Trying: $qwenExe..." -ForegroundColor Yellow
            if ($qwenExe -like "*qwen.exe") {
                # Try full path from money-transfer-app
                if (Test-Path $qwenExe) {
                    & $qwenExe -m $m -p $p --project $project
                    $success = $true
                    break
                }
            }
            else {
                # Try standard qwen command
                & $qwenExe -m $m -p $p --project $project
                $success = $true
                break
            }
        }
    }
    catch {
        Write-Host "Failed with $qwenExe : $_" -ForegroundColor Red
        continue
    }
}

if (-not $success) {
    Write-Host "ERROR: Could not run Qwen with any available method." -ForegroundColor Red
    Write-Host "Tried the following:" -ForegroundColor Yellow
    Write-Host "1. qwen command (from PATH)" -ForegroundColor Gray
    Write-Host "2. ollama run qwen2.5-coder" -ForegroundColor Gray
    Write-Host "3. qwen.exe from money-transfer-app folder" -ForegroundColor Gray
    Write-Host "4. python -m qwen" -ForegroundColor Gray
    Write-Host "" -ForegroundColor Gray
    Write-Host "Solutions:" -ForegroundColor Cyan
    Write-Host "- If you have ollama: ollama pull qwen2.5-coder" -ForegroundColor Green
    Write-Host "- Copy qwen.exe from money-transfer-app to this folder" -ForegroundColor Green
    Write-Host "- Add qwen to your PATH environment variable" -ForegroundColor Green
    Write-Host "- Install qwen via pip: pip install qwen" -ForegroundColor Green
}
