
# === GitHub remote reachability check ===
if (-not (Get-Command git.exe -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git not found. Please install Git for Windows." -ForegroundColor Red
    exit 1
}

try {
    git rev-parse --is-inside-work-tree | Out-Null
}
catch {
    Write-Host "❌ Not inside a Git repository." -ForegroundColor Red
    exit 1
}

$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    Write-Host "❌ No 'origin' remote found. Please set one with: git remote add origin <url>" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Checking remote reachability..." -ForegroundColor Yellow
try {
    git ls-remote $remoteUrl | Out-Null
    Write-Host "✅ Remote reachable: $remoteUrl" -ForegroundColor Green
}
catch {
    Write-Host "❌ Cannot reach remote: $remoteUrl" -ForegroundColor Red
    exit 1
}

# === Git presence check ===
if (-not (Get-Command git.exe -ErrorAction SilentlyContinue)) {
    Write-Host "⚠ Git not found in PATH. Attempting to locate..." -ForegroundColor Yellow
    $possiblePath = "C:\Program Files\Git\cmd\git.exe"
    if (Test-Path $possiblePath) {
        $env:Path += ";C:\Program Files\Git\cmd"
        Write-Host "✅ Git found and added to PATH for this session." -ForegroundColor Green
    }
    else {
        Write-Host "❌ Git not installed or not found. Please install from https://git-scm.com/download/win" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Git version: $(git --version)" -ForegroundColor Green

param(
    [string]$GitHubUser,
    [string]$RepoName,
    [string]$BackendCmd
)

function Timestamp { Get-Date -Format "yyyy-MM-dd HH:mm:ss" }
function Tagstamp { Get-Date -Format "yyyyMMddHHmmss" }

if (-not $GitHubUser -or -not $RepoName) {
    Write-Host "Usage: .\cra_to_vite_with_preflight_backend_autolaunch_jsxfix.ps1 <github-username> <repo-name> [backend-start-command]" -ForegroundColor Yellow
    exit 1
}

# === PREFLIGHT CHECKS ===
Write-Host "=== PREFLIGHT CHECKS ==="

# Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $(node -v)"

# npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm version: $(npm -v)"

# Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed or not in PATH." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Git version: $(git --version)"

# Backend availability
Write-Host "Checking backend at http://localhost:4002..."
try {
    $resp = Invoke-WebRequest -Uri "http://localhost:4002" -UseBasicParsing -TimeoutSec 3
    if ($resp.StatusCode -eq 200) {
        Write-Host "✅ Backend is responding."
    }
    else {
        throw
    }
}
catch {
    Write-Host "⚠ Backend not responding on port 4002." -ForegroundColor Yellow
    if ($BackendCmd) {
        Write-Host "🚀 Starting backend with: $BackendCmd"
        Start-Process powershell -ArgumentList "-NoExit", "-Command $BackendCmd"
        Start-Sleep -Seconds 5
        try {
            $resp = Invoke-WebRequest -Uri "http://localhost:4002" -UseBasicParsing -TimeoutSec 3
            if ($resp.StatusCode -eq 200) {
                Write-Host "✅ Backend started successfully."
            }
            else {
                Write-Host "❌ Backend still not responding. Proceeding, but proxy may fail." -ForegroundColor Red
            }
        }
        catch {
            Write-Host "❌ Backend still not responding. Proceeding, but proxy may fail." -ForegroundColor Red
        }
    }
    else {
        Write-Host "ℹ No backend start command provided. Skipping auto-start."
    }
}

function Snapshot-AndPush($Message, $Tag) {
    if (-not (Test-Path ".git")) {
        git init
    }

    git add .
    git commit -m $Message

    if (Test-Path "package.json") {
        npm audit --json | Out-File -Encoding utf8 "npm_audit_$Tag.json"
        Write-Host "📄 Audit results saved to npm_audit_$Tag.json"
    }

    if (-not (git remote | Select-String "origin")) {
        git remote add origin "https://github.com/$GitHubUser/$RepoName.git"
    }

    git branch -M main
    git push -u origin main
    git tag -a $Tag -m $Message
    git push origin --tags
}

# === STEP 1: Pre‑migration snapshot ===
Write-Host "=== SNAPSHOT: Pre‑migration ==="
Snapshot-AndPush "Pre‑migration snapshot $(Timestamp)" "pre-migration-$(Tagstamp)"

# === STEP 2: CRA → Vite migration ===
Write-Host "=== MIGRATION: CRA → Vite ==="
npm uninstall react-scripts
npm install --save-dev vite @vitejs/plugin-react

# === Create fixed vite.config.js with JSX loader and updated port ===
@"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4001,
    proxy: {
      '/api': {
        target: 'http://localhost:4002',
        changeOrigin: true,
        secure: false
      }
    }
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/, // Treat all .js files in src as JSX
  }
});
"@ | Out-File -Encoding utf8 vite.config.js

# === Remove extra HTML files except root index.html ===
Get-ChildItem -Recurse -Include *.html |
Where-Object { $_.FullName -ne (Join-Path (Get-Location) "index.html") } |
Remove-Item -Force
Write-Host "✅ vite.config.js updated and extra HTML files cleaned up" -ForegroundColor Green

# === Update package.json scripts (PowerShell native) ===
if (Test-Path "package.json") {
    $pkg = Get-Content package.json -Raw | ConvertFrom-Json
    $pkg.scripts = @{
        dev     = "vite"
        build   = "vite build"
        preview = "vite preview"
    }
    $pkg | ConvertTo-Json -Depth 10 | Set-Content package.json -Encoding UTF8
    Write-Host "✅ package.json scripts updated for Vite" -ForegroundColor Green
}
else {
    Write-Host "⚠ package.json not found — skipping script update" -ForegroundColor Yellow
}

# === STEP 3: Post‑migration snapshot ===
Write-Host "=== SNAPSHOT: Post‑migration ==="
Snapshot-AndPush "Post‑migration snapshot $(Timestamp)" "post-migration-$(Tagstamp)"

# === STEP 4: Auto‑launch frontend & backend ===
Write-Host "=== LAUNCHING FRONTEND & BACKEND ==="
if ($BackendCmd) {
    Write-Host "🚀 Starting backend..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command $BackendCmd"
}
Write-Host "🚀 Starting frontend..."
npm run dev
