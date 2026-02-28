# Changelog

## Version 1.2.1 (Feb 28, 2026)

### Fixed
- **CI fix**: removed `package-lock.json` from `.gitignore` so GitHub Actions `npm ci` can find the lock file and the npm cache works correctly

## Version 1.2.0 — Meaningful Table Colors (Feb 28, 2026)

### Changed
- **Replaced `table` dependency with `cli-table3`** for richer, bordered table output
- **Added semantic color coding in table view** — every cell is now colored based on its field name and value:
  - `status` fields: green (active/paid/completed), red (inactive/cancelled/failed), yellow (pending/frozen)
  - `is_*` / `has_*` boolean fields: green ✓ / red ✗
  - Amount/price/monetary fields: magenta
  - Currency fields: yellow
  - ID fields: dim white
  - Date/time fields: blue
  - Name fields: bold white
  - Email/phone fields: cyan
  - URL fields: underlined blue
  - Boolean values: green ✓ true / red ✗ false
- **Column headers** remain cyan bold
- **Table borders** are gray for a clean look

---

## Version 1.1.0 — API Accuracy & Command Fixes (Feb 28, 2026)

### consumers command — Fixed & Expanded
- **Fixed**: `--phone` renamed to `--phone-number` (correct API field name)
- **Fixed**: `--email` is now optional (was incorrectly required; only `name` is required)
- **Added**: `--external-id` flag → `external_id`
- **Added**: `--iban` flag → `iban` (max 34 chars)
- **Added**: `--alias` flag → `alias`
- **Added**: `--comment` flag → `comment`
- **Added**: `--preferred-language` flag → `preferred_language` (validated: `AR` or `EN`)
- **Added**: `--communication-methods` flag → `communication_methods` (comma-separated, validated: `WHATSAPP`, `EMAIL`, `SMS`)
- **Added**: `--data <json>` flag on `create` and `update` for raw JSON body input
- **Fixed**: `delete` no longer calls `OutputFormatter.output()` (API returns empty `{}`)
- **Added**: `get` now shows success message on retrieval
- **Added**: `list` now shows info message before fetching

### checkout command — Complete Rewrite
- **Removed**: `--amount` flag (does not exist in the API)
- **Removed**: `--redirect-url` flag (replaced by two separate flags)
- **Removed**: `--metadata` flag (wrong field name)
- **Fixed**: `--currency` is now optional with default `SAR` (was incorrectly required)
- **Added**: `--name` flag (required — was missing entirely)
- **Added**: `--items <json>` flag (required — JSON array of product items)
- **Added**: `--coupons <uuids>` flag (comma-separated coupon UUIDs)
- **Added**: `--max-number-of-payments <n>` flag
- **Added**: `--valid-until <datetime>` flag
- **Added**: `--confirmation-message <msg>` flag
- **Added**: `--payment-methods <json>` flag (e.g. `{"visa":true,"mastercard":true}`)
- **Added**: `--success-redirect-url <url>` flag
- **Added**: `--failure-redirect-url <url>` flag
- **Added**: `--organization-consumer-id <uuid>` flag
- **Added**: `--custom-metadata <json>` flag (was incorrectly named `--metadata`)
- **Added**: `--contact-information-type <PHONE|EMAIL>` flag
- **Added**: `--data <json>` flag on `create` for raw JSON body input
- **Fixed**: `activate` status value corrected from `'active'` → `'ACTIVE'` (API requires uppercase)
- **Fixed**: `deactivate` status value corrected from `'inactive'` → `'INACTIVE'`
- **Added**: `--deactivate-message <msg>` flag on `deactivate`
- **Added**: New `update-status` subcommand with `--status` (ACTIVE|INACTIVE|COMPLETED), `--deactivate-message`, `--data`
- **Added**: `get` now shows success message on retrieval
- **Added**: `list` now shows info message before fetching
- **Added**: `list` new filter flags: `--statuses`, `--from-date`, `--to-date`, `--from-price`, `--to-price`, `--product-ids`, `--currencies`
- **Removed**: `list --search` flag (does not exist in the API)

### coupons command — Fixed & Expanded
- **Fixed**: Removed nonexistent fields (`--code`, `--discount-type`, `--max-uses`, `--expires-at`, `--metadata`)
- **Fixed**: Correct fields: `--name`, `--discount-value`, `--is-percentage`, `--currency`, `--is-active`
- **Added**: `--data <json>` flag on `create` and `update`
- **Fixed**: `delete` no longer calls `OutputFormatter.output()` (API returns empty `{}`)
- **Added**: `list` new filter flags: `--active`, `--is-percentage`
- **Fixed**: `list --search` now correctly maps to `search_term` query param

### client.ts — 422 Validation Error Handling
- **Added**: Proper handling of FastAPI/Pydantic `{ detail: [{ loc, msg, type }] }` 422 error format
- **Fixed**: Users now see field-level validation messages instead of generic "Request failed with status code 422"

### utils.ts — Pagination Field Names Fixed
- **Fixed**: `PaginationInfo` now uses real API field names: `current_page`, `max_page`, `total_count`, `has_next_page`, `has_previous_page`
- **Fixed**: `printPaginationInfo` now displays correct pagination data with `← prev` / `next →` navigation hints

---

## Version 1.0.0 - Initial Release

### Features
- Complete CLI tool for Stream Pay API
- Support for all API operations (consumers, payments, subscriptions, invoices, products, coupons, payment links)
- Multiple output formats (JSON, Table, Pretty)
- Flexible configuration system (env vars, config file, CLI flags)
- Branch scoping support
- Pagination, filtering, and sorting
- AI-agent optimized with structured JSON output

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
