#!/bin/bash
# Usage: ./cra_to_vite_with_backup.sh <github-username> <repo-name>

USER_NAME=$1
REPO_NAME=$2

if [ -z "$USER_NAME" ] || [ -z "$REPO_NAME" ]; then
  echo "Usage: $0 <github-username> <repo-name>"
  exit 1
fi

timestamp() {
  date '+%Y-%m-%d %H:%M:%S'
}

tagstamp() {
  date '+%Y%m%d%H%M%S'
}

snapshot_and_push() {
  local msg="$1"
  local tag="$2"

  # Init repo if needed
  if [ ! -d ".git" ]; then
    git init
  fi

  git add .
  git commit -m "$msg"

  # Run npm audit if package.json exists
  if [ -f "package.json" ]; then
    npm audit --json > "npm_audit_${tag}.json"
    echo "Audit results saved to npm_audit_${tag}.json"
  fi

  # Add remote if missing
  if ! git remote | grep -q origin; then
    git remote add origin https://github.com/$USER_NAME/$REPO_NAME.git
  fi

  git branch -M main
  git push -u origin main
  git tag -a "${tag}" -m "$msg"
  git push origin --tags
}

echo "=== SNAPSHOT: Pre‑migration ==="
snapshot_and_push "Pre‑migration snapshot $(timestamp)" "pre-migration-$(tagstamp)"

echo "=== MIGRATION: CRA → Vite ==="
npm uninstall react-scripts
npm install --save-dev vite @vitejs/plugin-react
# Add vite.config.js
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

echo "=== SNAPSHOT: Post‑migration ==="
snapshot_and_push "Post‑migration snapshot $(timestamp)" "post-migration-$(tagstamp)"

echo "✅ Migration complete and both states backed up to GitHub."
