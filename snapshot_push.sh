#!/bin/bash
# Usage: ./snapshot_push.sh <github-username> <repo-name> ["optional commit message"]

USER_NAME=$1
REPO_NAME=$2
COMMIT_MSG=${3:-"Snapshot $(date '+%Y-%m-%d %H:%M:%S')"}

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

# 4. Add remote if missing
if ! git remote | grep -q origin; then
  echo "Adding remote origin..."
  git remote add origin https://github.com/$USER_NAME/$REPO_NAME.git
fi

# 5. Ensure branch is main
git branch -M main

# 6. Push to GitHub
git push -u origin main
