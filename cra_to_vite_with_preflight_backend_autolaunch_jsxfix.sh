# === Git presence check ===
if ! command -v git >/dev/null 2>&1; then
  echo "⚠ Git not found in PATH. Attempting to locate..."
  if [ -x "/c/Program Files/Git/cmd/git.exe" ]; then
    export PATH="$PATH:/c/Program Files/Git/cmd"
    echo "✅ Git found and added to PATH for this session."
  else
    echo "❌ Git not installed or not found. Please install from https://git-scm.com/download/win"
    exit 1
  fi
fi
echo "✅ Git version: $(git --version)"
#!/bin/bash
# Usage: ./cra_to_vite_with_preflight_backend_autolaunch_jsxfix.sh <github-username> <repo-name> [backend-start-command]

USER_NAME=$1
REPO_NAME=$2
BACKEND_CMD=$3  # e.g. "npm run dev" or "node server.js"

if [ -z "$USER_NAME" ] || [ -z "$REPO_NAME" ]; then
  echo "Usage: $0 <github-username> <repo-name> [backend-start-command]"
  exit 1
fi

timestamp() { date '+%Y-%m-%d %H:%M:%S'; }
tagstamp() { date '+%Y%m%d%H%M%S'; }

# === PREFLIGHT CHECKS ===
echo "=== PREFLIGHT CHECKS ==="

# Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is not installed."
  exit 1
fi
echo "✅ Node.js version: $(node -v)"

# npm
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is not installed."
  exit 1
fi
echo "✅ npm version: $(npm -v)"

# Git
if ! command -v git >/dev/null 2>&1; then
  echo "❌ Git is not installed or not in PATH."
  exit 1
fi
echo "✅ Git version: $(git --version)"

# Backend availability
echo "Checking backend at http://localhost:4002..."
if curl -s --head http://localhost:4002 | grep "200 OK" > /dev/null; then
  echo "✅ Backend is responding."
else
  echo "⚠ Backend not responding on port 4002."
  if [ -n "$BACKEND_CMD" ]; then
    echo "🚀 Starting backend with: $BACKEND_CMD"
    $BACKEND_CMD &
    sleep 5
    if curl -s --head http://localhost:4002 | grep "200 OK" > /dev/null; then
      echo "✅ Backend started successfully."
    else
      echo "❌ Backend still not responding. Proceeding, but proxy may fail."
    fi
  else
    echo "ℹ No backend start command provided. Skipping auto-start."
  fi
fi

# === SNAPSHOT FUNCTION ===
snapshot_and_push() {
  local msg="$1"
  local tag="$2"

  if [ ! -d ".git" ]; then
    git init
  fi

  git add .
  git commit -m "$msg"

  if [ -f "package.json" ]; then
    npm audit --json > "npm_audit_${tag}.json"
    echo "📄 Audit results saved to npm_audit_${tag}.json"
  fi

  if ! git remote | grep -q origin; then
    git remote add origin https://github.com/$USER_NAME/$REPO_NAME.git
  fi

  git branch -M main
  git push -u origin main
  git tag -a "${tag}" -m "$msg"
  git push origin --tags
}

# === STEP 1: Pre‑migration snapshot ===
echo "=== SNAPSHOT: Pre‑migration ==="
snapshot_and_push "Pre‑migration snapshot $(timestamp)" "pre-migration-$(tagstamp)"

# === STEP 2: CRA → Vite migration ===
echo "=== MIGRATION: CRA → Vite ==="
npm uninstall react-scripts
npm install --save-dev vite @vitejs/plugin-react

# Create fixed vite.config.js with JSX loader and updated port
cat > vite.config.js <<EOL
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
    include: /src\\/.*\\.js$/, // Treat all .js files in src as JSX
  }
});
EOL

# Remove extra HTML files except root index.html
find . -type f -name "*.html" ! -path "./index.html" -delete
echo "✅ vite.config.js updated and extra HTML files cleaned up"


# Update package.json scripts
npx npm-check-updates -u
npm install
npx json -I -f package.json -e 'this.scripts={"dev":"vite","build":"vite build","preview":"vite preview"}'

# === STEP 3: Post‑migration snapshot ===
echo "=== SNAPSHOT: Post‑migration ==="
snapshot_and_push "Post‑migration snapshot $(timestamp)" "post-migration-$(tagstamp)"

# === STEP 4: Auto‑launch frontend & backend ===
echo "=== LAUNCHING FRONTEND & BACKEND ==="
if [ -n "$BACKEND_CMD" ]; then
  echo "🚀 Starting backend..."
  $BACKEND_CMD &
fi
echo "🚀 Starting frontend..."
npm run dev
