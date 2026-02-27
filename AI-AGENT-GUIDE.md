# AI Agent Integration Guide

This guide explains how AI agents can effectively use the Stream Pay CLI tool.

## Overview

The Stream Pay CLI is designed to be used by AI agents with structured JSON output, consistent error handling, and comprehensive command support.

## Key Principles for AI Agents

### 1. Always Use JSON Format

For machine-readable output, always append `--format json`:

```bash
streampay consumer list --format json
streampay payment get PAYMENT_ID --format json
```

### 2. Error Handling

The CLI returns:
- Exit code `0` for success
- Exit code `1` for errors
- Structured error messages in JSON format (when using `--format json`)

Example error handling in bash:
```bash
if result=$(streampay payment get INVALID_ID --format json 2>&1); then
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
streampay consumer list --api-key YOUR_KEY --format json
```

## Common AI Agent Workflows

### Workflow 1: Create a Complete Subscription

```bash
# Step 1: Create consumer
consumer_response=$(streampay consumer create --data '{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+966501234567"
}' --format json)

consumer_id=$(echo "$consumer_response" | jq -r '.id')

# Step 2: Create product
product_response=$(streampay product create --data '{
  "name": "Premium Plan",
  "price": 99.99,
  "currency": "SAR",
  "billing_cycle": "monthly"
}' --format json)

product_id=$(echo "$product_response" | jq -r '.id')

# Step 3: Create subscription
subscription_response=$(streampay subscription create --data '{
  "consumer_id": "'$consumer_id'",
  "items": [
    {
      "product_id": "'$product_id'",
      "quantity": 1
    }
  ],
  "auto_renew": true
}' --format json)

echo "Subscription created: $subscription_response"
```

### Workflow 2: Process Pending Invoices

```bash
# Get all pending invoices
pending_invoices=$(streampay invoice list \
  --filter status=pending \
  --format json)

# Extract invoice IDs
invoice_ids=$(echo "$pending_invoices" | jq -r '.data[] | .id')

# Process each invoice
for invoice_id in $invoice_ids; do
    echo "Processing invoice: $invoice_id"
    
    # Get invoice details
    invoice=$(streampay invoice get "$invoice_id" --format json)
    
    # Update status or take action
    streampay invoice update "$invoice_id" \
      --data '{"status": "processing"}' \
      --format json
done
```

### Workflow 3: Monitor Failed Payments

```bash
# Get failed payments from last 24 hours
current_time=$(date +%s)
one_day_ago=$((current_time - 86400))

payments=$(streampay payment list \
  --filter status=failed \
  --format json)

# Filter by date and extract details
echo "$payments" | jq --arg since "$one_day_ago" '
  .data[] |
  select(.created_at | tonumber > ($since | tonumber)) |
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

# Get all successful payments for the month
payments=$(streampay payment list \
  --filter status=paid \
  --filter created_at_month="$current_month" \
  --format json)

# Calculate total revenue
total_revenue=$(echo "$payments" | jq '[.data[] | .amount] | add')

echo "Total revenue for $current_month: $total_revenue SAR"

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
# CREATE
streampay consumer create --data '{"name":"...","email":"..."}' --format json

# READ
streampay consumer get CONSUMER_ID --format json
streampay consumer list --format json

# UPDATE
streampay consumer update CONSUMER_ID --data '{"name":"..."}' --format json

# DELETE
streampay consumer delete CONSUMER_ID --format json
```

### Payment Operations

```bash
# READ
streampay payment get PAYMENT_ID --format json
streampay payment list --filter status=pending --format json

# ACTIONS
streampay payment mark-paid PAYMENT_ID --format json
streampay payment refund PAYMENT_ID --format json
streampay payment auto-charge CONSUMER_ID --data '{"amount":100}' --format json
```

### Subscription Operations

```bash
# CREATE
streampay subscription create --file subscription.json --format json

# READ
streampay subscription get SUBSCRIPTION_ID --format json
streampay subscription list --filter status=active --format json

# UPDATE
streampay subscription update SUBSCRIPTION_ID --data '{}' --format json

# ACTIONS
streampay subscription cancel SUBSCRIPTION_ID --format json
streampay subscription freeze SUBSCRIPTION_ID --data '{"start_date":"..."}' --format json
```

### Invoice Operations

```bash
# CREATE
streampay invoice create --data '{}' --format json

# READ
streampay invoice get INVOICE_ID --format json
streampay invoice list --format json

# UPDATE
streampay invoice update INVOICE_ID --data '{}' --format json
```

### Product Operations

```bash
# CREATE
streampay product create --data '{"name":"...","price":99.99}' --format json

# READ
streampay product get PRODUCT_ID --format json
streampay product list --format json

# UPDATE
streampay product update PRODUCT_ID --data '{}' --format json

# DELETE
streampay product delete PRODUCT_ID --format json
```

## Data Parsing with jq

The CLI outputs valid JSON that can be parsed with `jq`:

```bash
# Extract specific fields
streampay consumer list --format json | jq '.data[] | {id, email}'

# Filter results
streampay payment list --format json | jq '.data[] | select(.amount > 100)'

# Count results
streampay invoice list --format json | jq '.data | length'

# Get specific value
consumer_id=$(streampay consumer get ID --format json | jq -r '.id')

# Complex transformations
streampay subscription list --format json | jq '
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
if streampay payment get PAYMENT_ID --format json > payment.json; then
    echo "Success"
else
    echo "Failed to get payment"
    exit 1
fi
```

### 2. Capture and Parse Errors

```bash
error_output=$(streampay consumer create --data '{}' --format json 2>&1)
if [ $? -ne 0 ]; then
    error_message=$(echo "$error_output" | jq -r '.error // .message // "Unknown error"')
    echo "Error: $error_message"
fi
```

### 3. Validate Before Operations

```bash
# Check if consumer exists before creating subscription
if streampay consumer get "$consumer_id" --format json > /dev/null 2>&1; then
    streampay subscription create --data "{\"consumer_id\":\"$consumer_id\"}" --format json
else
    echo "Consumer not found: $consumer_id"
    exit 1
fi
```

## Performance Tips

### 1. Use Pagination for Large Datasets

```bash
# Process in batches
page=1
while true; do
    result=$(streampay consumer list --page $page --per-page 100 --format json)
    
    # Check if we got results
    count=$(echo "$result" | jq '.data | length')
    if [ "$count" -eq 0 ]; then
        break
    fi
    
    # Process results
    echo "$result" | jq '.data[] | .email'
    
    page=$((page + 1))
done
```

### 2. Use Filters to Reduce Data Transfer

```bash
# Instead of getting all and filtering locally
streampay payment list --filter status=pending --filter amount_gt=100 --format json

# Not recommended (fetches everything)
streampay payment list --format json | jq '.data[] | select(.status == "pending" and .amount > 100)'
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
    streampay consumer create --data '{"name":"test"}' --format json
fi
```

### 2. Use Example Files

```bash
# Keep examples for consistent testing
streampay subscription create --file examples/subscription-create.json --format json
```

### 3. Dry Run Pattern

```bash
# Preview before executing
data='{"name":"Test User","email":"test@example.com"}'
echo "Would create consumer with data: $data"
read -p "Continue? (y/n) " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    streampay consumer create --data "$data" --format json
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
