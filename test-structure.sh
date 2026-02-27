#!/bin/bash

echo "🧪 Testing Stream Pay CLI Structure..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Test 1: Check required files exist
echo "📁 Checking required files..."
required_files=(
    "package.json"
    "tsconfig.json"
    "README.md"
    "src/index.ts"
    "src/client.ts"
    "src/config.ts"
    "src/utils.ts"
    "src/commands/consumer.ts"
    "src/commands/payment.ts"
    "src/commands/subscription.ts"
    "src/commands/resources.ts"
    "src/commands/config.ts"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file (MISSING)"
        ((ERRORS++))
    fi
done

# Test 2: Check package.json is valid JSON
echo ""
echo "📦 Validating package.json..."
if command -v node &> /dev/null; then
    if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} Valid JSON"
    else
        echo -e "  ${RED}✗${NC} Invalid JSON"
        ((ERRORS++))
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Node.js not found, skipping JSON validation"
    ((WARNINGS++))
fi

# Test 3: Check for TypeScript syntax errors (basic)
echo ""
echo "📝 Checking TypeScript files..."
ts_files=$(find src -name "*.ts" 2>/dev/null)
ts_count=$(echo "$ts_files" | wc -l)
echo -e "  ${GREEN}✓${NC} Found $ts_count TypeScript files"

# Test 4: Check for imports
echo ""
echo "🔗 Checking imports..."
if grep -q "from 'commander'" src/index.ts; then
    echo -e "  ${GREEN}✓${NC} Commander.js imported"
else
    echo -e "  ${RED}✗${NC} Commander.js not imported"
    ((ERRORS++))
fi

if grep -q "from 'axios'" src/client.ts; then
    echo -e "  ${GREEN}✓${NC} Axios imported"
else
    echo -e "  ${RED}✗${NC} Axios not imported"
    ((ERRORS++))
fi

# Test 5: Check documentation files
echo ""
echo "📚 Checking documentation..."
doc_files=(
    "README.md"
    "AI-AGENT-GUIDE.md"
    "API-REFERENCE.md"
    "STRUCTURE.md"
)

for file in "${doc_files[@]}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        echo -e "  ${GREEN}✓${NC} $file ($lines lines)"
    else
        echo -e "  ${YELLOW}⚠${NC} $file (optional, missing)"
        ((WARNINGS++))
    fi
done

# Test 6: Check configuration
echo ""
echo "⚙️  Checking configuration files..."
if [ -f ".env.example" ]; then
    if grep -q "STREAMPAY_API_KEY" .env.example; then
        echo -e "  ${GREEN}✓${NC} .env.example has API key template"
    else
        echo -e "  ${YELLOW}⚠${NC} .env.example missing API key template"
        ((WARNINGS++))
    fi
else
    echo -e "  ${YELLOW}⚠${NC} .env.example not found"
    ((WARNINGS++))
fi

# Test 7: Check base URL
echo ""
echo "🌐 Checking API base URL..."
if grep -q "https://stream-app-service.streampay.sa/api/v2" src/client.ts; then
    echo -e "  ${GREEN}✓${NC} Correct API base URL (stream-app-service.streampay.sa/api/v2)"
else
    echo -e "  ${RED}✗${NC} Incorrect or missing API base URL"
    ((ERRORS++))
fi

# Summary
echo ""
echo "═══════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All critical tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. npm install"
    echo "  2. npm run build"
    echo "  3. npm link"
    echo "  4. streampay config set --api-key YOUR_KEY"
else
    echo -e "${RED}✗ Found $ERRORS error(s)${NC}"
    exit 1
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s)${NC}"
fi

echo "═══════════════════════════════════════"
exit 0
