# autorun_travel_app.ps1
# Automatically switches to the Travel-Car-Hotel-Reservation-App project and runs Qwen for it

param(
    [string]$prompt = "You are the fullstack Engineer. Inspect my database connection and propose improvements.",
    [string]$model = "qwen/qwen-2.5-coder-32b-instruct:free",
    [switch]$free,
    [switch]$local
)

# Default to free if no specific option is chosen
if (-not $local -and -not $free) {
    $free = $true
}

# Automatically set the attached Travel-Car-Hotel-Reservation-App folder as the current workspace
$projectPath = "C:\Users\great\Documents\AI_Projects\Travel-Car-Hotel-Reservation-App"
Set-Location $projectPath
Write-Host "Switched to project directory: $projectPath"

# Run Qwen for the Travel app project
$runQwenScript = Join-Path $projectPath "run_qwen.ps1"
if (Test-Path $runQwenScript) {
    Write-Host "Running Qwen for Travel-Car-Hotel-Reservation-App..."
    if ($local) {
        & $runQwenScript -m $model -p $prompt -local
    }
    elseif ($free) {
        & $runQwenScript -m $model -p $prompt -free
    }
    else {
        & $runQwenScript -m $model -p $prompt
    }
}
else {
    Write-Host "Qwen script not found in Travel-Car-Hotel-Reservation-App."
}
