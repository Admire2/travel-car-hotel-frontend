@echo off
REM run_qwen.bat - Batch launcher for Qwen with Travel-Car-Hotel-Reservation-App
REM Usage: run_qwen.bat "Your prompt here"
REM Usage: run_qwen.bat --inspect
REM Usage: run_qwen.bat --free "Your prompt"
REM Usage: run_qwen.bat --local "Your prompt"

setlocal enabledelayedexpansion

REM Get the current directory
set "PROJECT_DIR=%cd%"

REM Default parameters
set "MODEL=qwen/qwen-2.5-coder-32b-instruct:free"
set "PROMPT=%~1"
set "PROJECT=travel-car-hotel-reservation-app"
set "FREE_FLAG="
set "LOCAL_FLAG="

REM Check for flags
if "%~1"=="--inspect" (
    set "PROMPT=You are a fullstack engineer. Inspect the database connection configuration in this Travel-Car-Hotel-Reservation-App project. Review config/database.js, backend models, and suggest improvements for connection handling, error management, and performance."
    set "FREE_FLAG=--free"
)

if "%~1"=="--free" (
    set "PROMPT=%~2"
    set "FREE_FLAG=--free"
)

if "%~1"=="--local" (
    set "PROMPT=%~2"
    set "LOCAL_FLAG=--local"
    set "MODEL=qwen2.5-coder"
)

REM Validation
if "%PROMPT%"=="" (
    echo ERROR: No prompt provided. 
    echo Usage: run_qwen.bat "Your prompt here"
    echo        run_qwen.bat --inspect  (free database inspection)
    echo        run_qwen.bat --free "Your prompt"  (free OpenRouter)
    echo        run_qwen.bat --local "Your prompt" (local Ollama)
    exit /b 1
)

echo RUNNING: Qwen for %PROJECT%
echo MODEL: %MODEL%
if "%FREE_FLAG%"=="--free" echo COST: FREE (rate limited)
if "%LOCAL_FLAG%"=="--local" echo COST: FREE (local)
echo PROMPT: %PROMPT%
echo DIRECTORY: %PROJECT_DIR%
echo ----------------------------------------

REM Call PowerShell script with parameters
powershell.exe -ExecutionPolicy Bypass -File "%PROJECT_DIR%\qwen.ps1" -m "%MODEL%" -p "%PROMPT%" -project "%PROJECT%" %FREE_FLAG% %LOCAL_FLAG%

pause