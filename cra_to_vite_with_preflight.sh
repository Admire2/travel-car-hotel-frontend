#!/bin/bash
# Usage: ./cra_to_vite_with_preflight.sh <github-username> <repo-name>

USER_NAME=$1
REPO_NAME=$2

if [ -z "$USER_NAME" ] || [ -z "$REPO_NAME" ]; then
  echo "Usage: $0 <github-username> <repo-name>"
  exit 1
fi

timestamp() { date '+%Y-%m-%d %H:%M:%S'; }
tagstamp() { date '+%Y%m%d%H%M%S'; }

# === PREFLIGHT CHECKS ===
echo "=== PREFLIGHT CHECKS ==="

# 1. Node.js check
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is not installed. Install it before running this script."
  exit 1
fi
echo "✅ Node.js version: $(node -v)"

# 2. npm check
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is not installed. Install it before running this script."
  exit 1
fi
echo "✅ npm version: $(npm -v)"

# 3. Backend availability check
echo "Checking backend at http://localhost:4002..."
if curl -s --head http://localhost:4002 | grep "200 OK" > /dev/null; then
  echo "✅ Backend is responding."
else
  echo "⚠ Backend not responding on port 4002. Proceeding, but proxy may fail in dev mode."
fi

# 4. Git check
if ! command -v git >/dev/null 2>&1; then
  echo "❌ Git is not installed or not in PATH."
  exit 1
fi
echo "✅ Git version: $(git --version)"

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

# Create vite.config.js with your custom ports and backend proxy
cat > vite.config.js <<EOL
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 40001,
    proxy: {
      '/api': {
        target: 'http://localhost:4002',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
EOL

# Update package.json scripts
npx npm-check-updates -u
npm install
npx json -I -f package.json -e 'this.scripts={"dev":"vite","build":"vite build","preview":"vite preview"}'

# === STEP 3: Post‑migration snapshot ===
echo "=== SNAPSHOT: Post‑migration ==="
snapshot_and_push "Post‑migration snapshot $(timestamp)" "post-migration-$(tagstamp)"

echo "✅ Migration complete: CRA removed, Vite configured for port 40001 frontend + proxy to localhost:4002 backend, both states backed up to GitHub."
