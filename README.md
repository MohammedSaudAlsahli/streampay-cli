# StreamPay CLI

Official command-line interface for the StreamPay API. A powerful, type-safe CLI tool for managing consumers, payments, subscriptions, invoices, and more.

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
git clone https://github.com/streampay/streampay-cli.git
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
git clone https://github.com/streampay/streampay-cli.git
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

### 2. Verify Connection

```bash
streampay whoami
```

### 3. Run Your First Commands

```bash
# List all consumers
streampay consumer list

# Get payment details
streampay payment get PAYMENT_ID

# Create a new product
streampay product create --data '{
  "name": "Premium Plan",
  "price": 99.99,
  "currency": "SAR"
}'
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
streampay login                           # Authenticate with API key
streampay logout                          # Remove stored credentials
streampay whoami                          # Display current authentication info
streampay config set <options>            # Set configuration values
streampay config get                      # Display current configuration
streampay config clear                    # Clear all configuration
streampay config path                     # Show config file location
```

### Consumers

Manage customer profiles:

```bash
streampay consumer create                 # Create a new consumer
streampay consumer get <id>               # Get consumer by ID
streampay consumer list                   # List all consumers
streampay consumer update <id>            # Update consumer details
streampay consumer delete <id>            # Delete a consumer
```

### Payments

Process and manage payments:

```bash
streampay payment get <id>                # Get payment by ID
streampay payment list                    # List all payments
streampay payment mark-paid <id>          # Mark payment as paid
streampay payment refund <id>             # Refund a payment
streampay payment auto-charge <id>        # Auto-charge a consumer
```

### Subscriptions

Handle recurring billing:

```bash
streampay subscription create             # Create a new subscription
streampay subscription get <id>           # Get subscription by ID
streampay subscription list               # List all subscriptions
streampay subscription update <id>        # Update subscription
streampay subscription cancel <id>        # Cancel a subscription
streampay subscription freeze <id>        # Freeze a subscription
streampay subscription unfreeze <id>      # Unfreeze a subscription
streampay subscription freezes <id>       # List subscription freezes
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
streampay product create                  # Create a new product
streampay product get <id>                # Get product by ID
streampay product list                    # List all products
streampay product update <id>             # Update product
streampay product delete <id>             # Delete a product
```

### Coupons

Create and manage discount codes:

```bash
streampay coupon create                   # Create a new coupon
streampay coupon get <id>                 # Get coupon by ID
streampay coupon list                     # List all coupons
streampay coupon update <id>              # Update coupon
streampay coupon delete <id>              # Delete a coupon
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

### Documentation

Access API documentation from the CLI:

```bash
streampay docs                            # List available topics
streampay docs consumers                  # Consumer documentation
streampay docs payments                   # Payment documentation
streampay docs subscriptions              # Subscription documentation
streampay docs webhooks                   # Webhook documentation
```

## Usage Examples

### Create a Consumer

```bash
streampay consumer create --data '{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+966501234567"
}'
```

### Create from a JSON File

```bash
streampay consumer create --file consumer.json
```

Where `consumer.json` contains:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+966501234567"
}
```

### List Payments with Filters

```bash
streampay payment list \
  --filter status=pending \
  --sort-by created_at \
  --sort-order desc \
  --page 1 \
  --per-page 20 \
  --format table
```

### Create a Subscription

```bash
streampay subscription create --data '{
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
streampay subscription freeze sub_789 --data '{
  "start_date": "2024-01-01",
  "end_date": "2024-02-01",
  "reason": "Customer request"
}'
```

### Create a Coupon

```bash
streampay coupon create --data '{
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
streampay payment auto-charge cons_123 --data '{
  "amount": 99.99,
  "currency": "SAR",
  "description": "Monthly subscription renewal"
}'
```

### Refund a Payment

```bash
streampay payment refund pay_456
```

### Complete Subscription Flow

```bash
# 1. Create a consumer
consumer_id=$(streampay consumer create --data '{
  "name": "Jane Smith",
  "email": "jane@example.com"
}' --format json | jq -r '.id')

# 2. Create a product
product_id=$(streampay product create --data '{
  "name": "Pro Plan",
  "price": 49.99,
  "currency": "SAR"
}' --format json | jq -r '.id')

# 3. Create a subscription
streampay subscription create --data '{
  "consumer_id": "'$consumer_id'",
  "items": [{"product_id": "'$product_id'", "quantity": 1}],
  "auto_renew": true
}' --format json
```

### Monitor Pending Invoices

```bash
streampay invoice list \
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
streampay consumer get cons_123
streampay consumer get cons_123 --format pretty
```

### JSON

Machine-readable JSON output, perfect for scripting and AI agents:

```bash
streampay consumer list --format json
```

### Table

ASCII table format for list views:

```bash
streampay payment list --format table
```

## Development

### Development Mode

Run directly with TypeScript (no compilation):

```bash
npm run dev -- consumer list
npm run dev -- payment get pay_123 --format json
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
   streampay consumer list --api-key YOUR_KEY --branch production
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
streampay consumer get INVALID_ID --format json
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

## License

MIT License

Copyright (c) 2024 StreamPay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Support

For issues, questions, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/streampay/streampay-cli/issues)
- **Documentation**: [https://docs.streampay.sa](https://docs.streampay.sa)
- **Email**: support@stream.sa

---

Built with ❤️ by the StreamPay team
