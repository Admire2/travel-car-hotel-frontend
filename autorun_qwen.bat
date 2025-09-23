@echo off
REM Automatically run run_qwen.ps2 if in the project folder
IF /I "%CD%"=="C:\Users\great\Documents\AI_Projects\Travel-Car&Hotel-Reservation-App" (
    powershell -ExecutionPolicy Bypass -File run_qwen.ps2
)