# StreamPay CLI

Unofficial command-line interface for the StreamPay API. A powerful, type-safe CLI tool for managing consumers, payments, subscriptions, invoices, and more.

## Features

- **Comprehensive API Coverage** - Manage all StreamPay resources from the command line
- **Consumers** - Create and manage customer profiles
- **Payments** - Process payments, refunds, and auto-charge operations
- **Subscriptions** - Handle recurring billing and subscription lifecycles
- **Invoices** - Create, send, and manage invoices
- **Products** - Manage product catalog and pricing
- **Coupons** - Create and manage discount codes
- **Payment Links** - Generate shareable checkout links
- **Webhooks** - Manage webhook events and verification
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

If you prefer to install manually:

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

Login with your StreamPay API credentials:

```bash
streampay login
```

You'll be prompted to enter your API key. Alternatively, set it directly:

```bash
streampay config set --api-key YOUR_API_KEY
```

### 2. Run Your First Commands

```bash
# List all consumers
streampay consumers list

# Get payment details
streampay checkout get PAYMENT_ID

# Create a new product
streampay products create -n "premium plan" -p "99.99" -c "SAR"
```

## Authentication

### Login Command

The easiest way to authenticate:

```bash
streampay login
```

This stores your API key securely in `~/.streampay/config.json`.

### Logout

```bash
streampay logout
```

### Config File Location

Configuration is stored at:
- **macOS/Linux**: `~/.streampay/config.json`
- **Windows**: `%USERPROFILE%\.streampay\config.json`

### Environment Variables

Create a `.env` file in your project directory:

```env
STREAMAPP_API_KEY=your_api_key_here
STREAMAPP_BASE_URL=https://stream-app-service.streampay.sa/api/v2
STREAMAPP_BRANCH=production
```

Available environment variables:
- `STREAMAPP_API_KEY` - Your StreamPay API key
- `STREAMAPP_BASE_URL` - API base URL (optional)
- `STREAMAPP_BRANCH` - Branch name for scoped requests (optional)

## Commands

### Authentication & Configuration

```bash
streampay login
streampay login --api-key <key>        API key
streampay login --api-secret <secret>  API secret
streampay login --branch <branch>      Default branch
streampay login --base-url <url>       API base URL
```

### Consumers

Manage customer profiles:

```bash
streampay consumers create                 # Create a new consumer
streampay consumers get <id>               # Get consumer by ID
streampay consumers list                   # List all consumers
streampay consumers update <id>            # Update consumer details
streampay consumers delete <id>            # Delete a consumer
```

### Payments

Process and manage payments:

```bash
streampay payments get <id>                # Get payment by ID
streampay payments list                    # List all payments
streampay payments mark-paid <id>          # Mark payment as paid
streampay payments refund <id>             # Refund a payment
streampay payments auto-charge <id>        # Auto-charge a consumer
```

### Subscriptions

Handle recurring billing:

```bash
streampay subs create             # Create a new subscription
streampay subs get <id>           # Get subscription by ID
streampay subs list               # List all subscriptions
streampay subs update <id>        # Update subscription
streampay subs cancel <id>        # Cancel a subscription
streampay subs freeze <id>        # Freeze a subscription
streampay subs unfreeze <id>      # Unfreeze a subscription
streampay subs freezes <id>       # List subscription freezes
```

Aliases: `streampay sub` works as shorthand for `subscription`

### Invoices

Create and manage invoices:

```bash
streampay invoice create                  # Create a new invoice
streampay invoice get <id>                # Get invoice by ID
streampay invoice list                    # List all invoices
streampay invoice update <id>             # Update invoice
streampay invoice send <id>               # Send invoice to customer
streampay invoice accept <id>             # Accept an invoice
streampay invoice reject <id>             # Reject an invoice
streampay invoice complete <id>           # Mark invoice as complete
streampay invoice cancel <id>             # Cancel an invoice
```

### Products

Manage your product catalog:

```bash
streampay products create                  # Create a new product
streampay products get <id>                # Get product by ID
streampay products list                    # List all products
streampay products update <id>             # Update product
streampay products delete <id>             # Delete a product
```

### Coupons

Create and manage discount codes:

```bash
streampay coupons create                   # Create a new coupon
streampay coupons get <id>                 # Get coupon by ID
streampay coupons list                     # List all coupons
streampay coupons update <id>              # Update coupon
streampay coupons delete <id>              # Delete a coupon
```

### Checkout (Payment Links)

Generate shareable payment links:

```bash
streampay checkout create                 # Create a checkout link
streampay checkout get <id>               # Get checkout link by ID
streampay checkout list                   # List all checkout links
streampay checkout activate <id>          # Activate a checkout link
streampay checkout deactivate <id>        # Deactivate a checkout link
```

Aliases: `streampay payment-link` works as an alternative

### Webhooks

Manage webhook events:

```bash
streampay webhook events                  # List webhook events
streampay webhook verify                  # Verify webhook signature
```

## Usage Examples

### Create a Consumer

```bash
streampay consumers create --name "John Doe" --email "john@example.com" --phone "+966501234567"
```

### List Payments with Filters

```bash
streampay payments list \
  --filter status=pending \
  --sort-by created_at \
  --sort-order desc \
  --page 1 \
  --per-page 20 \
  --format table
```

### Create a Subscription

```bash
streampay subs create --data '{
  "consumer_id": "cons_123",
  "items": [
    {
      "product_id": "prod_456",
      "quantity": 1
    }
  ],
  "auto_renew": true
}'
```

### Freeze a Subscription

```bash
streampay subs freeze sub_789 --data '{
  "start_date": "2024-01-01",
  "end_date": "2024-02-01",
  "reason": "Customer request"
}'
```

### Create a Coupon

```bash
streampay coupons create --data '{
  "code": "SAVE20",
  "discount_type": "percentage",
  "discount_value": 20,
  "active": true,
  "max_uses": 100
}'
```

### Create a Payment Link

```bash
streampay checkout create --data '{
  "amount": 100,
  "currency": "SAR",
  "description": "Premium Subscription",
  "redirect_url": "https://example.com/success"
}'
```

### Auto-Charge a Consumer

```bash
streampay payments auto-charge cons_123 --data '{
  "amount": 99.99,
  "currency": "SAR",
  "description": "Monthly subscription renewal"
}'
```

### Refund a Payment

```bash
streampay payments refund pay_456
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
streampay subs create --data '{
  "consumer_id": "'$consumer_id'",
  "items": [{"product_id": "'$product_id'", "quantity": 1}],
  "auto_renew": true
}' --format json
```

### Monitor Pending Invoices

```bash
streampay invoices list \
  --filter status=pending \
  --sort-by created_at \
  --sort-order desc \
  --format json | jq '.data[] | {id, amount, consumer_id}'
```

## Output Formats

The CLI supports three output formats via the `--format` flag:

### Pretty (Default)

Human-readable, colorized output:

```bash
streampay consumers get cons_123
streampay consumers get cons_123 --format pretty
```

### JSON

Machine-readable JSON output, perfect for scripting and AI agents:

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

Run directly with TypeScript (no compilation):

```bash
npm run dev -- consumers list
npm run dev -- payments get pay_123 --format json
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

Compiled output is written to the `dist/` directory.

### Run Compiled Version

```bash
npm run start -- consumer list
```

Or directly:

```bash
node dist/index.js consumer list
```

### Project Structure

```
streampay-cli/
├── src/
│   ├── index.ts              # Main entry point
│   ├── client.ts             # API client (Axios wrapper)
│   ├── config.ts             # Configuration manager
│   ├── utils.ts              # Output formatter and utilities
│   └── commands/
│       ├── config.ts         # Config commands
│       ├── consumer.ts       # Consumer commands
│       ├── payment.ts        # Payment commands
│       ├── subscription.ts   # Subscription commands
│       └── resources.ts      # Invoice, product, coupon, checkout
├── dist/                     # Compiled JavaScript (generated)
├── setup.sh                  # Installation script
└── package.json
```

## Configuration

The CLI reads configuration in the following priority order (highest to lowest):

1. **CLI Flags** - Options passed directly to commands
   ```bash
   streampay consumers list --api-key YOUR_KEY --branch production
   ```

2. **Environment Variables** - Set in `.env` or shell environment
   ```bash
   export STREAMAPP_API_KEY=your_key
   export STREAMAPP_BRANCH=production
   ```

3. **Config File** - Stored at `~/.streampay/config.json`
   ```bash
   streampay config set --api-key YOUR_KEY
   streampay config set --branch production
   ```

### View Current Configuration

```bash
streampay config get
```

### Set Configuration Values

```bash
streampay config set --api-key YOUR_API_KEY
streampay config set --base-url https://stream-app-service.streampay.sa/api/v2
streampay config set --branch production
```

### Clear Configuration

```bash
streampay config clear
```

### Config File Location

```bash
streampay config path
```

## API Documentation

For complete API reference and detailed guides:

- **Main Documentation**: [https://docs.streampay.sa](https://docs.streampay.sa)
- **Getting Started**: [https://docs.streampay.sa/docs/guides/GETTING_STARTED.md](https://docs.streampay.sa/docs/guides/GETTING_STARTED.md)
- **Authentication Guide**: [https://docs.streampay.sa/docs/guides/authentication.md](https://docs.streampay.sa/docs/guides/authentication.md)
- **Branches**: [https://docs.streampay.sa/docs/guides/branches.md](https://docs.streampay.sa/docs/guides/branches.md)
- **Webhooks**: [https://docs.streampay.sa/docs/guides/webhooks.md](https://docs.streampay.sa/docs/guides/webhooks.md)
- **Error Handling**: [https://docs.streampay.sa/docs/guides/ERRORS.md](https://docs.streampay.sa/docs/guides/ERRORS.md)

### CLI Documentation Files

- **API-REFERENCE.md** - Maps CLI commands to API documentation
- **AI-AGENT-GUIDE.md** - AI agent integration patterns
- **STRUCTURE.md** - Project architecture
- **CHANGELOG.md** - Version history

## Troubleshooting

### API Key Not Found

```bash
Error: API key not found. Please set it using:
  streampay config set --api-key YOUR_KEY
```

**Solution**: Set your API key:
```bash
streampay login
# or
streampay config set --api-key YOUR_API_KEY
```

### Connection Issues

**Check base URL**:
```bash
streampay config set --base-url https://stream-app-service.streampay.sa/api/v2
```

### Branch Errors

**Set the correct branch**:
```bash
streampay config set --branch production
```

### Debug Mode

Use `--format json` to see full error details:
```bash
streampay consumers get INVALID_ID --format json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/streampay-cli.git`
3. Install dependencies: `npm install`
4. Make your changes
5. Build and test: `npm run build`
6. Submit a pull request

## Support

For issues, questions, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/streampay/streampay-cli/issues)
- **Documentation**: [https://docs.streampay.sa](https://docs.streampay.sa)
---

Built with ❤️ by Mohammed Alsahli
