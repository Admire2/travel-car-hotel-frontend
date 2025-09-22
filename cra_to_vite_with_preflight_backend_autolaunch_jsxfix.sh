#!/usr/bin/env bash
set -e

# === Git presence check ===
if ! command -v git >/dev/null 2>&1; then
  echo "❌ Git not found. Please install Git."
  exit 1
fi

# === GitHub remote reachability check ===
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Not inside a Git repository."
  exit 1
fi

remote_url=$(git remote get-url origin 2>/dev/null)
if [ -z "$remote_url" ]; then
  echo "❌ No 'origin' remote found. Please set one with: git remote add origin <url>"
  exit 1
fi

echo "🔍 Checking remote reachability..."
if ! git ls-remote "$remote_url" >/dev/null 2>&1; then
  echo "❌ Cannot reach remote: $remote_url"
  exit 1
fi
echo "✅ Remote reachable: $remote_url"

# === Install Vite & React plugin ===
npm install --save-dev vite @vitejs/plugin-react

# === Create fixed vite.config.js ===
cat > vite.config.js <<'EOL'
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
    include: /src\/.*\.js$/,
  }
});
EOL

# === Remove extra HTML files ===
find . -type f -name "*.html" ! -path "./index.html" -delete
echo "✅ vite.config.js updated and extra HTML files cleaned up"

# === Update package.json scripts ===
if [ -f package.json ]; then
  tmpfile=$(mktemp)
  jq '.scripts = {dev:"vite", build:"vite build", preview:"vite preview"}' package.json > "$tmpfile" && mv "$tmpfile" package.json
  echo "✅ package.json scripts updated for Vite"
else
  echo "⚠ package.json not found — skipping script update"
fi
