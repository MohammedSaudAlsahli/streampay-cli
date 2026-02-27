#!/bin/bash

echo "🚀 Setting up Stream Pay CLI..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✓ Node.js version: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build the project
echo ""
echo "🔨 Building the project..."
npm run build

# Link globally
echo ""
echo "🔗 Linking CLI globally..."
npm link

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Set your API key:"
echo "     $ streampay config set --api-key YOUR_API_KEY"
echo ""
echo "  2. Test the connection:"
echo "     $ streampay whoami"
echo ""
echo "  3. View examples:"
echo "     $ streampay examples"
echo ""
echo "  4. Access API documentation:"
echo "     $ streampay docs"
echo ""
echo "For AI agents, always use --format json for structured output:"
echo "  $ streampay consumer list --format json"
echo ""
echo "📖 Documentation:"
echo "   - README.md - Complete usage guide"
echo "   - AI-AGENT-GUIDE.md - AI agent integration patterns"
echo "   - API-REFERENCE.md - CLI commands → API docs mapping"
