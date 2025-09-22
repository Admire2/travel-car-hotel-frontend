#!/usr/bin/env bash
FRONTEND_PATH="${1:-$(dirname "$0")/frontend}"
REACT_SCRIPTS_VERSION="5.0.1"

echo "🚀 Running frontend preflight check..."

# Check Node version
NODE_VERSION=$(node -v | sed 's/v//')
if [[ "$(printf '%s\n' "14.0.0" "$NODE_VERSION" | sort -V | head -n1)" != "14.0.0" ]] || \
   [[ "$(printf '%s\n' "$NODE_VERSION" "20.99.99" | sort -V | head -n1)" != "$NODE_VERSION" ]]; then
    echo "⚠️ Node $NODE_VERSION is outside CRA's tested range (14–20)."
fi

# Path to react-scripts binary
REACT_SCRIPTS_BIN="$FRONTEND_PATH/node_modules/.bin/react-scripts"

if [[ ! -f "$REACT_SCRIPTS_BIN" ]]; then
    echo "📦 react-scripts not found in frontend. Installing..."
    (cd "$FRONTEND_PATH" && npm install "react-scripts@$REACT_SCRIPTS_VERSION" --save)
else
    echo "✅ react-scripts found."
fi

echo "Frontend preflight complete."
