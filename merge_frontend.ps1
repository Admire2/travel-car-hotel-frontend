# === PATHS ===
$source      = "C:\Users\great\Documents\AI_Projects\Travel-Car-Hotel-Reservation-App\frontend\frontend"
$destination = "C:\Users\great\Documents\AI_Projects\Travel-Car-Hotel-Reservation-App\frontend"
$logFile     = "C:\Users\great\Documents\AI_Projects\merge_log.txt"

# Ensure destination exists
if (-not (Test-Path $destination)) {
    New-Item -ItemType Directory -Path $destination | Out-Null
}

# Start logging
"=== MERGE STARTED: $(Get-Date) ===" | Out-File $logFile -Encoding UTF8

# Process each file in source
Get-ChildItem -Path $source -Recurse | ForEach-Object {
    if (-not $_.PSIsContainer) {
        $relativePath = $_.FullName.Substring($source.Length).TrimStart('\')
        $destFile = Join-Path $destination $relativePath
        $destDir = Split-Path $destFile

        # Create destination subfolder if needed
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            "Created folder: $destDir" | Out-File $logFile -Append
        }

        if (-not (Test-Path $destFile)) {
            Copy-Item $_.FullName $destFile
            "Copied: $relativePath" | Out-File $logFile -Append
        }
        else {
            $srcHash = Get-FileHash $_.FullName
            $dstHash = Get-FileHash $destFile
            if ($srcHash.Hash -eq $dstHash.Hash) {
                "Skipped (identical): $relativePath" | Out-File $logFile -Append
            }
            else {
                $newName = "{0}_{1}{2}" -f `
                    [System.IO.Path]::GetFileNameWithoutExtension($_.Name),
                    (Get-Date -Format "yyyyMMddHHmmss"),
                    [System.IO.Path]::GetExtension($_.Name)
                $newPath = Join-Path $destDir $newName
                Copy-Item $_.FullName $newPath
                "Renamed & Copied (different content): $relativePath → $newName" | Out-File $logFile -Append
            }
        }
    }
}

"=== MERGE COMPLETED: $(Get-Date) ===" | Out-File $logFile -Append
Write-Host "Merge complete. Log saved to $logFile"
