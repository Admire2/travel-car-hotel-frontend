Write-Host "🔍 Running frontend preflight checks..." -ForegroundColor Cyan

# 1. Ensure Node version
if (-not (nvm list | Select-String "20.19.5")) {
    Write-Host "⚠️ Node 20.19.5 not active. Run: nvm use 20.19.5" -ForegroundColor Yellow
    exit 1
}

# 2. Define react-scripts path
$reactScriptsBin = Join-Path (Resolve-Path ".") "node_modules\.bin\react-scripts.cmd"

# 3. If node_modules is missing, clean npm cache and reinstall
if (-Not (Test-Path "node_modules")) {
    Write-Host "🧹 Cleaning npm cache..." -ForegroundColor Yellow
    npm cache clean --force

    Write-Host "📦 Installing all packages..." -ForegroundColor Yellow
    npm install


# 4. Ensure react-scripts is installed
if (-Not (Test-Path $reactScriptsBin)) {
    Write-Host "⚠️ react-scripts not found. Installing..." -ForegroundColor Yellow
    npm install react-scripts@5.0.1 --save-dev
}

# 5. Start frontend dev server
Write-Host "🚀 Starting frontend development server..." -ForegroundColor Cyan
& $reactScriptsBin start
