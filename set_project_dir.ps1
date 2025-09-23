# VS Code Project Directory Fixer
# Usage: Run this script in PowerShell to always set your terminal to the current VS Code project folder.
# It will detect the open folder in VS Code and set the terminal to that directory.

# Get the current VS Code workspace folder from environment variable
$vsCodeFolder = $env:WORKSPACE_FOLDER

if (-not $vsCodeFolder) {
    Write-Host "VS Code WORKSPACE_FOLDER environment variable not set."
    Write-Host "Please open your project folder in VS Code, then run this script from the integrated terminal."
    exit 1
}

# Change to the VS Code workspace folder
Set-Location $vsCodeFolder
Write-Host "Terminal set to VS Code project folder: $vsCodeFolder"

# Optional: Open frontend directory if needed
# Set-Location "$vsCodeFolder\frontend"
# Write-Host "Terminal set to frontend directory: $vsCodeFolder\frontend"

# Now you can run npm, npx, node, etc. in the correct project.
