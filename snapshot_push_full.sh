#!/bin/bash
# Usage: ./snapshot_push_full.sh <github-username> <repo-name> ["optional commit message"]

USER_NAME=$1
REPO_NAME=$2
COMMIT_MSG=${3:-"Snapshot $(date '+%Y-%m-%d %H:%M:%S')"}
TAG_LABEL="migration-stage"

if [ -z "$USER_NAME" ] || [ -z "$REPO_NAME" ]; then
  echo "Usage: $0 <github-username> <repo-name> [commit message]"
  exit 1
fi

# 1. Init repo if not already
if [ ! -d ".git" ]; then
  echo "Initializing new Git repo..."
  git init
fi

# 2. Stage all changes
git add .

# 3. Commit
git commit -m "$COMMIT_MSG"

# 4. Run npm audit and log results
if [ -f "package.json" ]; then
  echo "Running npm audit..."
  npm audit --json > npm_audit_log.json
  echo "Audit results saved to npm_audit_log.json"
fi

# 5. Add remote if missing
if ! git remote | grep -q origin; then
  echo "Checking if GitHub repo exists..."
  if ! curl -s --head "https://github.com/$USER_NAME/$REPO_NAME" | grep "200 OK" > /dev/null; then
    echo "Creating GitHub repo via API..."
    curl -u "$USER_NAME" https://api.github.com/user/repos -d "{\"name\":\"$REPO_NAME\"}"
  fi
  git remote add origin https://github.com/$USER_NAME/$REPO_NAME.git
fi

# 6. Ensure branch is main
git branch -M main

# 7. Push to GitHub
git push -u origin main

# 8. Tag commit with migration stage
git tag -a "$TAG_LABEL-$(date '+%Y%m%d%H%M%S')" -m "Migration stage snapshot"
git push origin --tags

echo "✅ Snapshot pushed and tagged successfully."
