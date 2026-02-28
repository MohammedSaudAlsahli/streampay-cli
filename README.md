# StreamPay CLI

Unofficial command-line interface for the StreamPay API. A powerful, type-safe CLI tool for managing consumers, payments, subscriptions, invoices, products, coupons, checkout links, and webhooks.

## Features

- **Comprehensive API Coverage** - Manage all StreamPay resources from the command line
- **Consumers** - Create and manage customer profiles with full contact and preference support
- **Payments** - Process payments, refunds, and auto-charge operations
- **Subscriptions** - Handle recurring billing and subscription lifecycles
- **Invoices** - Create, send, and manage invoices
- **Products** - Manage product catalog and pricing
- **Coupons** - Create and manage discount codes
- **Checkout Links** - Generate shareable, configurable payment links
- **Webhooks** - List webhook events and verify signatures
- **Multiple Output Formats** - JSON, table, or pretty-printed output
- **Flexible Configuration** - Environment variables, config file, or CLI flags
- **Branch Support** - Scope API requests to specific branches
- **Type Safe** - Built with TypeScript for reliability
- **AI Agent Friendly** - Structured JSON output perfect for automation

## Installation

### Prerequisites

- Node.js 14 or higher
- npm or yarn

### Quick Install

Clone the repository and run the setup script:

```bash
git clone https://github.com/MohammedSaudAlsahli/streampay-cli.git
cd streampay-cli
bash setup.sh
```

The `setup.sh` script will:
1. Install dependencies (`npm install`)
2. Compile TypeScript to JavaScript (`npm run build`)
3. Link the CLI globally (`npm link`)

### Manual Installation

```bash
git clone https://github.com/MohammedSaudAlsahli/streampay-cli.git
cd streampay-cli
npm install
npm run build
npm link
```

### Verify Installation

```bash
streampay --version
streampay --help
```

## Quick Start

### 1. Authenticate

Set your API key:

```bash
streampay config set --api-key YOUR_API_KEY
```

### 2. Run Your First Commands

```bash
# List all consumers
streampay consumers list

# Get a payment by ID
streampay payments get <id>

# Create a checkout link
streampay checkout create --name "Premium Plan" --items '[{"product_id":"<uuid>","quantity":1}]'
```

## Authentication

### Config Commands

The primary way to authenticate and configure the CLI:

```bash
streampay config set --api-key YOUR_API_KEY
streampay config set --base-url https://stream-app-service.streampay.sa/api/v2
streampay config set --branch production
streampay config get
streampay config clear
streampay config path
```

Configuration is stored at `~/.streampay/config.json`.

### Environment Variables

Create a `.env` file in your project directory or export variables in your shell:

```env
STREAMPAY_API_KEY=your_api_key_here
STREAMPAY_BASE_URL=https://stream-app-service.streampay.sa/api/v2
STREAMPAY_BRANCH=production
```

Available environment variables:
- `STREAMPAY_API_KEY` - Your StreamPay API key
- `STREAMPAY_BASE_URL` - API base URL (optional)
- `STREAMPAY_BRANCH` - Branch name for scoped requests (optional)

### Configuration Priority

The CLI reads configuration in the following priority order (highest to lowest):

1. **CLI Flags** - Options passed directly to the command
   ```bash
   streampay consumers list --api-key YOUR_KEY --branch production
   ```

2. **Environment Variables** - Set in `.env` or shell environment
   ```bash
   export STREAMPAY_API_KEY=your_key
   export STREAMPAY_BRANCH=production
   ```

3. **Config File** - Stored at `~/.streampay/config.json`
   ```bash
   streampay config set --api-key YOUR_KEY
   ```

## Commands

### config

```bash
streampay config set --api-key YOUR_API_KEY
streampay config set --base-url https://stream-app-service.streampay.sa/api/v2
streampay config set --branch production
streampay config get
streampay config clear
streampay config path
```

### consumers

Manage customer profiles:

```bash
streampay consumers create --name "John Doe" --email "john@example.com" --phone-number "+966501234567"
streampay consumers get <id>
streampay consumers list
streampay consumers update <id> --name "New Name"
streampay consumers delete <id>
```

**`create` flags:**

| Flag | Description |
|---|---|
| `--name <name>` | Consumer's full name (required) |
| `--email <email>` | Email address |
| `--phone-number <number>` | Phone number |
| `--external-id <id>` | External reference ID |
| `--iban <iban>` | IBAN number |
| `--alias <alias>` | Short alias or nickname |
| `--comment <text>` | Internal comment |
| `--preferred-language <lang>` | `AR` or `EN` |
| `--communication-methods <methods>` | Comma-separated: `WHATSAPP,EMAIL,SMS` |
| `--data <json>` | Raw JSON body (alternative to individual flags) |

**`list` flags:** `--page`, `--limit`, `--search`, `--sort-field`, `--sort-direction`

**`update` flags:** Same as `create` flags (all optional), plus `--data <json>`

### payments

Process and manage payments:

```bash
streampay payments get <id>
streampay payments list
streampay payments mark-paid <id>
streampay payments refund <id>
streampay payments auto-charge <id>
```

**`list` flags:** `--page`, `--limit`, `--sort-field`, `--sort-direction`

### subscriptions

Handle recurring billing. The command is `subscriptions` (alias: `subs`):

```bash
streampay subscriptions create --data '{...}'
streampay subscriptions get <id>
streampay subscriptions list
streampay subscriptions update <id> --data '{...}'
streampay subscriptions cancel <id>
streampay subscriptions freeze <id> --data '{...}'
streampay subscriptions unfreeze <id>
streampay subscriptions freezes <id>
```

All write operations accept `--data <json>` for the request body.

### invoices

Create and manage invoices:

```bash
streampay invoices create --data '{...}'
streampay invoices get <id>
streampay invoices list
streampay invoices update <id> --data '{...}'
streampay invoices send <id>
streampay invoices accept <id>
streampay invoices reject <id>
streampay invoices complete <id>
streampay invoices cancel <id>
```

### products

Manage your product catalog:

```bash
streampay products create --data '{...}'
streampay products get <id>
streampay products list
streampay products update <id> --data '{...}'
streampay products delete <id>
```

### coupons

Create and manage discount codes:

```bash
streampay coupons create --name "SAVE10" --discount-value 10 --is-percentage true
streampay coupons get <id>
streampay coupons list
streampay coupons update <id> --name "NEW NAME" --is-active false
streampay coupons delete <id>
```

**`create` flags:**

| Flag | Description |
|---|---|
| `--name <name>` | Coupon name (required) |
| `--discount-value <n>` | Discount amount (required) |
| `--is-percentage` | Treat discount as a percentage |
| `--currency <code>` | `SAR`, `USD`, `EUR`, `GBP`, `AED`, `BHD`, `KWD`, `OMR`, `QAR` |
| `--is-active` | Set coupon active/inactive |
| `--data <json>` | Raw JSON body (alternative to individual flags) |

**`list` flags:** `--active`, `--is-percentage`

### checkout

Generate and manage shareable payment links:

```bash
streampay checkout create --name "Premium Plan" --items '[{"product_id":"<uuid>","quantity":1}]'
streampay checkout get <id>
streampay checkout list
streampay checkout activate <id>
streampay checkout deactivate <id> --deactivate-message "Temporarily unavailable"
streampay checkout update-status <id> --status <ACTIVE|INACTIVE|COMPLETED>
```

**`create` flags:**

| Flag | Description |
|---|---|
| `--name <name>` | Checkout link name (required) |
| `--items <json>` | JSON array of items (required) |
| `--description <text>` | Description |
| `--currency <code>` | `SAR` (default), `USD`, `EUR`, `GBP`, `AED`, `BHD`, `KWD`, `OMR`, `QAR` |
| `--coupons <uuids>` | Comma-separated coupon UUIDs |
| `--max-number-of-payments <n>` | Maximum number of payments allowed |
| `--valid-until <datetime>` | Expiry datetime (ISO 8601) |
| `--confirmation-message <msg>` | Message shown after payment |
| `--payment-methods <json>` | e.g. `'{"visa":true,"mastercard":true}'` |
| `--success-redirect-url <url>` | URL to redirect on success |
| `--failure-redirect-url <url>` | URL to redirect on failure |
| `--organization-consumer-id <uuid>` | Pre-assign a consumer |
| `--custom-metadata <json>` | Arbitrary metadata object |
| `--contact-information-type <type>` | `PHONE` or `EMAIL` |
| `--data <json>` | Raw JSON body (alternative to individual flags) |

**Items array shape:**
```json
[
  {
    "product_id": "<uuid>",
    "quantity": 1,
    "coupons": ["<coupon-uuid>"],
    "allow_custom_quantity": false,
    "min_quantity": 1,
    "max_quantity": 10
  }
]
```

**`list` flags:** `--statuses <ACTIVE,INACTIVE>`, `--from-date <datetime>`, `--to-date <datetime>`

**`update-status` flags:** `--status <ACTIVE|INACTIVE|COMPLETED>` (status values are uppercase)

### webhooks

```bash
streampay webhooks events
streampay webhooks verify --payload '...' --signature '...' --secret '...'
```

## Usage Examples

### Create a Consumer

```bash
# With individual flags
streampay consumers create --name "John Doe" --email "john@example.com" --phone-number "+966501234567"

# With Arabic language preference and multiple communication channels
streampay consumers create --name "Jane" --preferred-language AR --communication-methods "WHATSAPP,EMAIL"

# With raw JSON
streampay consumers create --data '{"name":"John","email":"john@example.com"}'
```

### List Consumers with Pagination and Sorting

```bash
streampay consumers list --page 1 --limit 20 --search "john" --sort-field name --sort-direction asc
```

### Create a Coupon

```bash
# Percentage discount
streampay coupons create --name "SAVE10" --discount-value 10 --is-percentage true

# Fixed amount discount in SAR
streampay coupons create --name "FLAT50" --discount-value 50 --currency SAR

# With raw JSON
streampay coupons create --data '{"name":"SAVE10","discount_value":10,"is_percentage":true}'
```

### Create a Checkout Link

```bash
# Basic checkout with a product
streampay checkout create \
  --name "Premium Plan" \
  --items '[{"product_id":"<uuid>","quantity":1}]'

# With currency, redirect URLs, and payment methods
streampay checkout create \
  --name "Bundle" \
  --items '[{"product_id":"<uuid>"}]' \
  --currency USD \
  --success-redirect-url "https://example.com/success" \
  --failure-redirect-url "https://example.com/failure"

# With raw JSON
streampay checkout create --data '{"name":"Plan","items":[{"product_id":"<uuid>"}]}'
```

### Update a Checkout Link Status

```bash
streampay checkout update-status <id> --status COMPLETED
streampay checkout deactivate <id> --deactivate-message "Temporarily unavailable"
```

### Create a Subscription

```bash
streampay subscriptions create --data '{
  "consumer_id": "<consumer-id>",
  "items": [
    {
      "product_id": "<product-id>",
      "quantity": 1
    }
  ],
  "auto_renew": true
}'
```

### Freeze a Subscription

```bash
streampay subscriptions freeze <id> --data '{
  "start_date": "2024-01-01",
  "end_date": "2024-02-01",
  "reason": "Customer request"
}'
```

### Refund a Payment

```bash
streampay payments refund <id>
```

### List Payments

```bash
streampay payments list --page 1 --limit 20 --sort-field created_at --sort-direction desc
```

### List Active Checkout Links

```bash
streampay checkout list --statuses ACTIVE --format json
```

### Complete Subscription Flow

```bash
# 1. Create a consumer
consumer_id=$(streampay consumers create --data '{
  "name": "Jane Smith",
  "email": "jane@example.com"
}' --format json | jq -r '.id')

# 2. Create a product
product_id=$(streampay products create --data '{
  "name": "Pro Plan",
  "price": 49.99,
  "currency": "SAR"
}' --format json | jq -r '.id')

# 3. Create a subscription
streampay subscriptions create --data '{
  "consumer_id": "'$consumer_id'",
  "items": [{"product_id": "'$product_id'", "quantity": 1}],
  "auto_renew": true
}' --format json
```

## Output Formats

The CLI supports three output formats via the `--format` flag:

### Pretty (Default)

Human-readable, colorized output:

```bash
streampay consumers get <id>
streampay consumers get <id> --format pretty
```

### JSON

Machine-readable JSON output, ideal for scripting and AI agents:

```bash
streampay consumers list --format json
```

### Table

ASCII table format for list views:

```bash
streampay payments list --format table
```

## Development

### Development Mode

Run directly with TypeScript (no compilation step):

```bash
npm run dev -- consumers list
npm run dev -- payments get <id> --format json
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

Compiled output is written to the `dist/` directory.

### Run Compiled Version

```bash
npm run start -- consumers list
# or
node dist/index.js consumers list
```

### Project Structure

```
streampay-cli/
├── src/
│   ├── index.ts              # Main entry point, registers all command groups
│   ├── client.ts             # StreamAppClient — Axios wrapper for all API calls
│   ├── config.ts             # ConfigManager — reads env vars and config file
│   ├── utils.ts              # OutputFormatter and utility functions
│   └── commands/
│       ├── config.ts         # Config commands
│       ├── consumers.ts      # Consumer commands
│       ├── payments.ts       # Payment commands
│       ├── subscriptions.ts  # Subscription commands
│       ├── invoices.ts       # Invoice commands
│       ├── products.ts       # Product commands
│       ├── coupons.ts        # Coupon commands
│       ├── checkout.ts       # Checkout / payment link commands
│       └── webhooks.ts       # Webhook commands
├── dist/                     # Compiled JavaScript (generated, do not edit)
├── examples/                 # Example scripts
├── setup.sh                  # Installation script
└── package.json
```

## Troubleshooting

### API Key Not Found

```
Error: API key not found. Please set it using:
  streampay config set --api-key YOUR_KEY
```

**Solution**: Set your API key:

```bash
streampay config set --api-key YOUR_API_KEY
```

Or export it as an environment variable:

```bash
export STREAMPAY_API_KEY=your_key
```

### Connection Issues

Check and set the correct base URL:

```bash
streampay config set --base-url https://stream-app-service.streampay.sa/api/v2
```

### Branch Errors

Set the correct branch:

```bash
streampay config set --branch production
```

### Debug Mode

Use `--format json` to see full response details:

```bash
streampay consumers get <id> --format json
```

## API Documentation

For the complete API reference and guides:

- **Main Documentation**: [https://docs.streampay.sa](https://docs.streampay.sa)
- **Getting Started**: [https://docs.streampay.sa/docs/guides/GETTING_STARTED.md](https://docs.streampay.sa/docs/guides/GETTING_STARTED.md)
- **Authentication Guide**: [https://docs.streampay.sa/docs/guides/authentication.md](https://docs.streampay.sa/docs/guides/authentication.md)
- **Branches**: [https://docs.streampay.sa/docs/guides/branches.md](https://docs.streampay.sa/docs/guides/branches.md)
- **Webhooks**: [https://docs.streampay.sa/docs/guides/webhooks.md](https://docs.streampay.sa/docs/guides/webhooks.md)
- **Error Handling**: [https://docs.streampay.sa/docs/guides/ERRORS.md](https://docs.streampay.sa/docs/guides/ERRORS.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/streampay-cli.git`
3. Install dependencies: `npm install`
4. Make your changes in `src/`
5. Build and verify: `npm run build`
6. Submit a pull request

## Support

For issues, questions, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/streampay/streampay-cli/issues)
- **Documentation**: [https://docs.streampay.sa](https://docs.streampay.sa)

---

Built with ❤️ by Mohammed Alsahli
