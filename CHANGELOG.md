# Changelog

## Version 1.0.0 - Initial Release

### Features
- ✅ Complete CLI tool for Stream Pay API
- ✅ Support for all API operations (consumers, payments, subscriptions, invoices, products, coupons, payment links)
- ✅ Multiple output formats (JSON, Table, Pretty)
- ✅ Flexible configuration system (env vars, config file, CLI flags)
- ✅ Branch scoping support
- ✅ Pagination, filtering, and sorting
- ✅ AI-agent optimized with structured JSON output

### Updates Based on Official Documentation

#### API Base URL
- **Updated**: Changed base URL to the correct endpoint `https://stream-app-service.streampay.sa/api/v2`
- **Previous (incorrect)**: `https://api.streampay.sa`
- **Files affected**: `src/client.ts`, `.env.example`, `README.md`, `API-REFERENCE.md`, `test-structure.sh`

#### Documentation Integration
- **Added**: New `docs` command for quick access to API documentation
- **Added**: `API-REFERENCE.md` - Complete mapping of CLI commands to official API docs
- **Added**: Links to all official Stream Pay documentation in README
- **Usage**: 
  ```bash
  streampay docs                # List all topics
  streampay docs consumers      # Open consumer docs
  streampay docs authentication # Open auth guide
  ```

#### Documentation URLs Added
All official Stream Pay documentation URLs have been integrated:

**Guides:**
- Getting Started: https://docs.streampay.sa/docs/guides/GETTING_STARTED.md
- Authentication: https://docs.streampay.sa/docs/guides/authentication.md
- Branches: https://docs.streampay.sa/docs/guides/branches.md
- Webhooks: https://docs.streampay.sa/docs/guides/webhooks.md
- Pagination & Filtering: https://docs.streampay.sa/docs/guides/pagination-and-filtering.md
- Error Handling: https://docs.streampay.sa/docs/guides/ERRORS.md
- Testing Cards: https://docs.streampay.sa/docs/guides/testing-cards.md
- Installments: https://docs.streampay.sa/docs/guides/installments.md

**API Endpoints:**
Each CLI command now maps to its official documentation:
- Consumers: v2-consumers-*
- Payments: v2-payments-*
- Subscriptions: v2-subscriptions-*
- Invoices: v2-invoices-*
- Products: v2-products-*
- Coupons: v2-coupons-*
- Payment Links: v2-payment-links-*

**SDKs:**
- TypeScript SDK: https://docs.streampay.sa/sdks/typescript.md
- Express SDK: https://docs.streampay.sa/sdks/express.md

### File Structure
```
streampay-cli/
├── package.json
├── tsconfig.json
├── setup.sh
├── .env.example
├── .gitignore
├── README.md                 # Complete usage guide
├── AI-AGENT-GUIDE.md        # AI integration patterns
├── API-REFERENCE.md         # NEW: CLI → API docs mapping
├── STRUCTURE.md             # Project structure documentation
├── CHANGELOG.md             # This file
├── src/
│   ├── index.ts             # Main entry (includes new docs command)
│   ├── client.ts            # API client (updated base URL)
│   ├── config.ts            # Configuration manager
│   ├── utils.ts             # Output formatters
│   └── commands/
│       ├── config.ts
│       ├── consumer.ts
│       ├── payment.ts
│       ├── subscription.ts
│       └── resources.ts
└── examples/
    ├── consumer-create.json
    └── subscription-create.json
```

### Commands Available

#### Core Commands
- `streampay config` - Manage configuration
- `streampay whoami` - Get user/org info
- `streampay examples` - Show usage examples
- `streampay docs [topic]` - Access API documentation (NEW)

#### Resource Commands
- `streampay consumer` - Consumer management
- `streampay payment` - Payment operations
- `streampay subscription` (alias: `sub`) - Subscription management
- `streampay invoice` - Invoice operations
- `streampay product` - Product management
- `streampay coupon` - Coupon management
- `streampay payment-link` - Payment link management

### AI Agent Integration

**Optimized for AI agents:**
- Structured JSON output with `--format json`
- Consistent command patterns
- Comprehensive error handling
- Exit codes for automation
- Scriptable operations

**Example AI workflow:**
```bash
# Get pending invoices
invoices=$(streampay invoice list --filter status=pending --format json)

# Process each invoice
echo "$invoices" | jq -r '.data[] | .id' | while read id; do
  streampay invoice update "$id" --data '{"status":"processing"}' --format json
done
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd streampay-cli

# Quick setup
./setup.sh

# Or manual setup
npm install
npm run build
npm link
```

### Configuration

```bash
# Set API key
streampay config set --api-key YOUR_API_KEY

# Set branch
streampay config set --branch production

# View current config
streampay config get
```

### Next Steps

For users:
1. Run `./setup.sh` to get started
2. Configure API key: `streampay config set --api-key YOUR_KEY`
3. Test connection: `streampay whoami`
4. View examples: `streampay examples`
5. Access docs: `streampay docs`

For AI agents:
1. Always use `--format json` for structured output
2. Check exit codes for success/failure
3. Parse responses with `jq` or similar tools
4. See `AI-AGENT-GUIDE.md` for detailed patterns

### Documentation

- **README.md** - Complete user guide
- **AI-AGENT-GUIDE.md** - AI integration guide with workflows
- **API-REFERENCE.md** - CLI command to API documentation mapping
- **STRUCTURE.md** - Project organization and architecture
- **CHANGELOG.md** - This file

### Support

- Main documentation: https://docs.streampay.sa
- CLI docs command: `streampay docs`
- GitHub issues: (to be added)
- Email: support@stream.sa (verify)
