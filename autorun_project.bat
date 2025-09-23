@echo off
REM Only run if in the project folder
IF /I "%CD%"=="C:\Users\great\Documents\AI_Projects\Travel-Car&Hotel-Reservation-App" (
    powershell -ExecutionPolicy Bypass -File run_qwen.ps2 -m qwen2.5-coder -p "Welcome! Qwen coder is ready. Your project environment is set up."
)
