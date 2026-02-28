# AI Agent Integration Guide

This guide explains how AI agents can effectively use the Stream Pay CLI tool.

## Overview

The Stream Pay CLI is designed to be used by AI agents with structured JSON output, consistent error handling, and comprehensive command support.

## Key Principles for AI Agents

### 1. Always Use JSON Format

For machine-readable output, always append `--format json`:

```bash
streampay consumers list --format json
streampay payments get PAYMENT_ID --format json
```

### 2. Error Handling

The CLI returns:
- Exit code `0` for success
- Exit code `1` for errors
- Structured error messages in JSON format (when using `--format json`)

Example error handling in bash:
```bash
if result=$(streampay payments get INVALID_ID --format json 2>&1); then
    echo "Success: $result"
else
    echo "Error occurred: $result"
    exit 1
fi
```

### 3. Configuration

Set up API credentials before making requests:

```bash
# Option 1: Use config command
streampay config set --api-key YOUR_API_KEY

# Option 2: Use environment variables
export STREAMPAY_API_KEY=your_api_key

# Option 3: Pass directly in command
streampay consumers list --api-key YOUR_KEY --format json
```

## Common AI Agent Workflows

### Workflow 1: Create a Complete Subscription

```bash
# Step 1: Create consumer
consumer_response=$(streampay consumers create \
  --name "John Doe" \
  --email "john@example.com" \
  --phone-number "+966501234567" \
  --format json)
consumer_id=$(echo "$consumer_response" | jq -r '.id')

# Step 2: Create product (use --data for complex objects)
product_response=$(streampay products create \
  --data '{"name":"Premium Plan","prices":[{"amount":"99.99","currency":"SAR","recurring_interval":"MONTH"}]}' \
  --format json)
product_id=$(echo "$product_response" | jq -r '.id')

# Step 3: Create subscription
streampay subscriptions create \
  --data "{\"consumer_id\":\"$consumer_id\",\"items\":[{\"product_id\":\"$product_id\",\"quantity\":1}]}" \
  --format json
```

### Workflow 2: Create a Payment Link

```bash
# Create a payment link for a product
link_response=$(streampay checkout create \
  --name "Premium Plan Checkout" \
  --items "[{\"product_id\":\"$product_id\",\"quantity\":1}]" \
  --currency SAR \
  --success-redirect-url "https://example.com/success" \
  --failure-redirect-url "https://example.com/failure" \
  --format json)

link_url=$(echo "$link_response" | jq -r '.url')
echo "Share this link: $link_url"
```

### Workflow 3: Monitor Failed Payments

```bash
# Get failed payments and extract details
payments=$(streampay payments list --format json)

# Filter by status and extract details
echo "$payments" | jq '
  .data[] |
  select(.status == "failed") |
  {
    id: .id,
    amount: .amount,
    consumer_id: .consumer_id,
    error: .error_message
  }'
```

### Workflow 4: Generate Reports

```bash
# Monthly revenue report
current_month=$(date +%Y-%m)

# Get all payments and filter locally
payments=$(streampay payments list --format json)

# Calculate total revenue
total_revenue=$(echo "$payments" | jq '[.data[] | .amount] | add')

echo "Total revenue: $total_revenue SAR"

# Get breakdown by product
echo "$payments" | jq -r '
  .data |
  group_by(.product_id) |
  map({
    product_id: .[0].product_id,
    count: length,
    total: map(.amount) | add
  })'
```

## Command Reference for AI Agents

### Consumer Operations

```bash
# CONSUMERS
streampay consumers create --name "John" --email "john@example.com" --format json
streampay consumers create --data '{"name":"John","email":"john@example.com"}' --format json
streampay consumers get CONSUMER_ID --format json
streampay consumers list --page 1 --limit 50 --format json
streampay consumers update CONSUMER_ID --name "New Name" --format json
streampay consumers update CONSUMER_ID --data '{"name":"New Name"}' --format json
streampay consumers delete CONSUMER_ID
```

### Payment Operations

```bash
# PAYMENTS
streampay payments get PAYMENT_ID --format json
streampay payments list --page 1 --limit 50 --format json
streampay payments mark-paid PAYMENT_ID --format json
streampay payments refund PAYMENT_ID --format json
streampay payments auto-charge PAYMENT_ID --format json
```

### Subscription Operations

```bash
# SUBSCRIPTIONS
streampay subscriptions create --data '{"consumer_id":"...","items":[{"product_id":"..."}]}' --format json
streampay subscriptions get SUBSCRIPTION_ID --format json
streampay subscriptions list --format json
streampay subscriptions update SUBSCRIPTION_ID --data '{}' --format json
streampay subscriptions cancel SUBSCRIPTION_ID --format json
streampay subscriptions freeze SUBSCRIPTION_ID --data '{"start_date":"...","end_date":"..."}' --format json
streampay subscriptions unfreeze SUBSCRIPTION_ID --format json
```

### Invoice Operations

```bash
# INVOICES
streampay invoices create --data '{}' --format json
streampay invoices get INVOICE_ID --format json
streampay invoices list --format json
streampay invoices update INVOICE_ID --data '{}' --format json
streampay invoices send INVOICE_ID --format json
```

### Product Operations

```bash
# PRODUCTS
streampay products create --data '{"name":"Pro Plan"}' --format json
streampay products get PRODUCT_ID --format json
streampay products list --format json
streampay products update PRODUCT_ID --data '{}' --format json
streampay products delete PRODUCT_ID
```

### Coupon Operations

```bash
# COUPONS
streampay coupons create --name "SAVE10" --discount-value 10 --is-percentage true --format json
streampay coupons create --data '{"name":"SAVE10","discount_value":10,"is_percentage":true}' --format json
streampay coupons get COUPON_ID --format json
streampay coupons list --active true --format json
streampay coupons update COUPON_ID --is-active false --format json
streampay coupons delete COUPON_ID
```

### Checkout (Payment Links) Operations

```bash
# CHECKOUT (PAYMENT LINKS)
streampay checkout create --name "Premium Plan" --items '[{"product_id":"PRODUCT_UUID","quantity":1}]' --format json
streampay checkout create --data '{"name":"Plan","items":[{"product_id":"PRODUCT_UUID"}]}' --format json
streampay checkout get LINK_ID --format json
streampay checkout list --statuses ACTIVE --format json
streampay checkout activate LINK_ID --format json
streampay checkout deactivate LINK_ID --deactivate-message "Temporarily closed" --format json
streampay checkout update-status LINK_ID --status COMPLETED --format json
```

## Data Parsing with jq

The CLI outputs valid JSON that can be parsed with `jq`:

```bash
# Extract specific fields
streampay consumers list --format json | jq '.data[] | {id, email}'

# Filter results
streampay payments list --format json | jq '.data[] | select(.amount > 100)'

# Count results
streampay invoices list --format json | jq '.data | length'

# Get specific value
consumer_id=$(streampay consumers get ID --format json | jq -r '.id')

# Complex transformations
streampay subscriptions list --format json | jq '
  .data |
  group_by(.status) |
  map({
    status: .[0].status,
    count: length
  })'
```

## Error Handling Best Practices

### 1. Check Exit Codes

```bash
if streampay payments get PAYMENT_ID --format json > payment.json; then
    echo "Success"
else
    echo "Failed to get payment"
    exit 1
fi
```

### 2. Capture and Parse Errors

```bash
error_output=$(streampay consumers create --data '{}' --format json 2>&1)
if [ $? -ne 0 ]; then
    error_message=$(echo "$error_output" | jq -r '.error // .message // "Unknown error"')
    echo "Error: $error_message"
fi
```

### 3. Validate Before Operations

```bash
# Check if consumer exists before creating subscription
if streampay consumers get "$consumer_id" --format json > /dev/null 2>&1; then
    streampay subscriptions create --data "{\"consumer_id\":\"$consumer_id\"}" --format json
else
    echo "Consumer not found: $consumer_id"
    exit 1
fi
```

## Performance Tips

### 1. Use Pagination for Large Datasets

```bash
page=1
while true; do
    result=$(streampay consumers list --page $page --limit 100 --format json)
    count=$(echo "$result" | jq '.data | length')
    if [ "$count" -eq 0 ]; then
        break
    fi
    echo "$result" | jq '.data[] | .email'
    has_next=$(echo "$result" | jq '.pagination.has_next_page')
    if [ "$has_next" != "true" ]; then
        break
    fi
    page=$((page + 1))
done
```

### 2. Filter with jq for Local Processing

```bash
# Get all payments and filter locally with jq
streampay payments list --format json | jq '.data[] | select(.status == "pending" and .amount > 100)'
```

## MCP Server Integration (Future)

The CLI can be wrapped as an MCP server for direct AI agent tool access. Example MCP server configuration:

```json
{
  "mcpServers": {
    "streampay": {
      "command": "streampay",
      "args": ["--format", "json"],
      "env": {
        "STREAMPAY_API_KEY": "your_api_key"
      }
    }
  }
}
```

## Testing & Validation

### 1. Validate JSON Before Sending

```bash
# Test JSON validity
if echo '{"name":"test"}' | jq empty; then
    streampay consumers create --data '{"name":"test"}' --format json
fi
```

### 2. Use Example Files

```bash
# Keep examples for consistent testing
cat examples/subscription-create.json
streampay subscriptions create --data "$(cat examples/subscription-create.json)" --format json
```

### 3. Dry Run Pattern

```bash
# Preview before executing
data='{"name":"Test User","email":"test@example.com"}'
echo "Would create consumer with data: $data"
read -p "Continue? (y/n) " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    streampay consumers create --data "$data" --format json
fi
```

## Security Best Practices

1. **Never log API keys**: Use environment variables or config files
2. **Validate input**: Check data before sending to API
3. **Use branch scoping**: Separate production and testing environments
4. **Handle errors gracefully**: Don't expose sensitive information in error messages

## Summary

The Stream Pay CLI is designed for seamless AI agent integration with:
- Structured JSON output (`--format json`)
- Consistent command patterns
- Comprehensive error handling
- Support for automation and scripting
- Full API coverage

For more examples and documentation, see the main README.md file.
