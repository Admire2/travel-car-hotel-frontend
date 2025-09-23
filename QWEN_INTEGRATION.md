# Qwen Integration for Travel-Car-Hotel-Reservation-App

This project includes enhanced Qwen scripts for AI-assisted development with **FREE** options available!

## 🆓 Free Options Available

### 1. OpenRouter Free Tier (Default)
- **Model**: `qwen/qwen-2.5-coder-32b-instruct:free`
- **Cost**: Completely FREE
- **Limits**: Rate limited but no API key required
- **Setup**: Ready to use immediately

### 2. Local Ollama (Best Option)
- **Model**: `qwen2.5-coder` (local)
- **Cost**: Completely FREE
- **Limits**: None (uses your hardware)
- **Setup**: Requires Ollama installation

### 3. OpenRouter with API Key
- **Cost**: Pay-per-use (very affordable)
- **Limits**: Higher rate limits
- **Setup**: Requires free API key registration

## Quick Start (FREE!)

### Option 1: Immediate Free Use (No Setup)
```powershell
# Use free model immediately - no configuration needed!
.\run_qwen.ps1 --free -p "Inspect my database connection"

# Database inspection with free model
.\run_qwen.ps1 --free --inspect

# Via autorun (uses free by default)
.\autorun_travel_app.ps1 "Inspect my database connection"
```

### Option 2: Local Installation (Best Performance)
```powershell
# 1. Install Ollama from https://ollama.ai
# 2. Pull the model
ollama pull qwen2.5-coder

# 3. Use local model
.\run_qwen.ps1 --local -p "Inspect my database connection"
.\run_qwen.ps1 --local --inspect
```

## Configuration Options

### No Configuration Needed (Free Tier)
Just run the scripts with `--free` flag - works immediately!

### Optional: API Key Setup (Better Limits)
Update your `.env` file only if you want higher rate limits:
```bash
OPENROUTER_API_KEY=your_actual_api_key_here  # Optional for paid tier
```

## Usage Options

### PowerShell Script (Recommended)
```powershell
# FREE TIER (Default - no setup needed)
.\run_qwen.ps1 --free -p "Inspect my database connection"
.\run_qwen.ps1 --free --inspect

# LOCAL (Best performance, requires Ollama)
.\run_qwen.ps1 --local -p "Review the API endpoints"
.\run_qwen.ps1 --local --inspect

# PAID (Higher limits, requires API key)
.\run_qwen.ps1 -p "Analyze my entire codebase"

# Autorun (FREE by default)
.\autorun_travel_app.ps1 "Your custom prompt here"
.\autorun_travel_app.ps1 --local "Your prompt for local model"
```

### Batch File (Alternative)
```cmd
rem FREE TIER
run_qwen.bat --free "Inspect my database connection"
run_qwen.bat --inspect  (uses free tier automatically)

rem LOCAL
run_qwen.bat --local "Review my code"
```

## Features

### Enhanced run_qwen.ps1

- ✅ **FREE tier support** - No API key required
- ✅ **Local Ollama support** - Completely free and private
- ✅ Automatic .env loading
- ✅ API key validation (optional)
- ✅ Project-specific prompts
- ✅ Database inspection mode
- ✅ Error handling
- ✅ Colored output
- ✅ Parameter validation

### Fixed autorun_travel_app.ps1

- ✅ Correct project path
- ✅ **FREE by default** - Uses free tier automatically
- ✅ Parameterized prompts
- ✅ Model selection (free/local/paid)
- ✅ Error handling

### Project-Specific Prompts

The `--inspect` flag automatically uses this optimized prompt:
> "You are a fullstack engineer. Inspect the database connection configuration in this Travel-Car-Hotel-Reservation-App project. Review config/database.js, backend models, and suggest improvements for connection handling, error management, and performance."

## Database Configuration Analysis

The scripts are configured to analyze:

- `config/database.js` - MongoDB connection setup
- `backend/models/` - Data models
- Environment variables in `.env`
- Connection error handling
- Performance optimization opportunities

## Example Commands

```powershell
# FREE DATABASE INSPECTION (No setup required!)
.\run_qwen.ps1 --free --inspect

# FREE API review
.\run_qwen.ps1 --free -p "Review all API endpoints in the backend/routes folder"

# LOCAL (Best performance after Ollama setup)
.\run_qwen.ps1 --local --inspect
.\run_qwen.ps1 --local -p "Analyze authentication and security implementations"

# AUTORUN with free tier (default)
.\autorun_travel_app.ps1 "Inspect my database connection"
.\autorun_travel_app.ps1 --local "Performance optimization analysis"
```

## Installation Options

### Option 1: Instant Use (FREE - No Installation)

No installation needed! Just run:

```powershell
.\run_qwen.ps1 --free --inspect
```

### Option 2: Local Installation (Best Performance)

```powershell
# 1. Install Ollama
# Download from https://ollama.ai and install

# 2. Pull Qwen model
ollama pull qwen2.5-coder

# 3. Verify installation
ollama list

# 4. Use local model
.\run_qwen.ps1 --local --inspect
```

### Option 3: API Key (Higher Limits)

```powershell
# 1. Get free API key from https://openrouter.ai/keys
# 2. Update .env file:
# OPENROUTER_API_KEY=your_key_here
# 3. Use paid tier:
.\run_qwen.ps1 -p "Comprehensive codebase analysis"
```

## Troubleshooting

1. **"qwen command not found"**
   - Install: `npm install -g qwen-cli`
   - Or use: `pip install qwen-cli`

2. **Free tier rate limits**
   - Use `--local` for unlimited usage
   - Or get free API key for higher limits

3. **Ollama not detected**
   - Install from: https://ollama.ai
   - Run: `ollama pull qwen2.5-coder`
   - Verify: `ollama list`

4. **Path errors**
   - Ensure you're running from the project root directory

5. **PowerShell execution policy**
   - Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## Cost Comparison

| Option | Cost | Setup Time | Performance | Limits |
|--------|------|------------|-------------|---------|
| **Free Tier** | FREE | 0 min | Good | Rate limited |
| **Local Ollama** | FREE | 5-10 min | Excellent | None |
| **API Key** | ~$0.01/query | 2 min | Excellent | High limits |

## Recommended Workflow

1. **Start with FREE tier** - Test immediately with `--free`
2. **Install Ollama** - For unlimited free usage
3. **Get API key** - Only if you need very high usage

## Project Structure Context

The scripts understand this project structure:

```
Travel-Car-Hotel-Reservation-App/
├── backend/          # Node.js backend
├── frontend/         # React frontend  
├── config/           # Configuration files
├── .env             # Environment variables (API key optional)
├── run_qwen.ps1     # Main Qwen script (FREE by default)
├── run_qwen.bat     # Batch alternative
└── autorun_travel_app.ps1  # Quick launcher (FREE by default)
```