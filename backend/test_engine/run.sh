#!/bin/bash

# Test Engine Runner Script

echo "========================================"
echo "🤖 ImpactNet AI Test Engine"
echo "========================================"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
cd /Users/xpiral/Projects/ImpactNet/backend
source .venv/bin/activate
pip install -q -r test_engine/requirements.txt

echo "✓ Dependencies installed"
echo ""

# Set Gemini API key (optional)
# export GEMINI_API_KEY="your-key-here"

# Run engine
echo "🚀 Starting test engine..."
echo ""
python test_engine/engine.py
