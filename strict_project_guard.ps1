# strict_project_guard.ps1
# Prevents any command from running unless you are in the correct project directory



$expectedProject = "C:\Users\great\Documents\AI_Projects\Travel-Car&Hotel-Reservation-App"
$currentDir = (Get-Location).Path

if ($currentDir -ne $expectedProject) {
    Write-Host "ERROR: Unauthorized project folder change detected!"
    Write-Host "Current directory: $currentDir"
    Write-Host "Expected directory: $expectedProject"
    Write-Host "Blocked: You must work only in $expectedProject."
    exit 1
}
else {
    Write-Host "You are in the correct project directory: $expectedProject"
    # Safe to run commands here
    # All automation will only proceed if this check passes
}
