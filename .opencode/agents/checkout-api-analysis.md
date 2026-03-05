# StreamPay Payment Links API Analysis

Generated: 2026-03-05

## Summary

| Endpoint | Required Params | Optional Params | CLI Gaps |
|----------|-----------------|-----------------|----------|
| Create Payment Link | 2 | 13 | 1 |
| Get Payment Link | 1 | 0 | 0 |
| List Payment Links | 0 | 11 | 0 |
| Update Payment Link Status | 1 | 1 | 0 |

**Total Required Parameters: 4**
**Total Gaps Found: 1**

---

## 1. Create Payment Link

**Endpoint:** `POST /api/v2/payment_links`

### Required Parameters

| Parameter | Type | Description | CLI Flag | Status |
|-----------|------|-------------|----------|--------|
| `name` | string | Name of the payment link | `--name` | ✓ |
| `items` | object[] | List of products to include (min 1) | `--items` | ✓ |

#### Items Array Structure

Each item object supports:

| Parameter | Type | Required | Default | Description | CLI Support |
|-----------|------|----------|---------|-------------|-------------|
| `product_id` | string | **Yes** | - | UUID of the product | Via JSON |
| `quantity` | integer | No | 1 | Quantity (>= 1) | Via JSON |
| `coupons` | string[] | No | - | Item-level coupon UUIDs | Via JSON |
| `allow_custom_quantity` | boolean | No | false | Allow custom quantity | Via JSON |
| `min_quantity` | integer | No | - | Min quantity if custom allowed | Via JSON |
| `max_quantity` | integer | No | - | Max quantity if custom allowed | Via JSON |

### Optional Parameters

| Parameter | Type | Default | Description | CLI Flag | Status |
|-----------|------|---------|-------------|----------|--------|
| `description` | string (nullable) | - | Description of the payment link | `--description` | ✓ |
| `currency` | enum | SAR | Currency code (SAR, USD, EUR, GBP, AED, BHD, KWD, OMR, QAR) | `--currency` | ✓ |
| `coupons` | string[] | - | Payment link level coupon UUIDs | `--coupons` | ✓ |
| `max_number_of_payments` | integer (nullable) | - | Max uses (null = unlimited) | `--max-number-of-payments` | ✓ |
| `valid_until` | string (nullable) | - | Expiry datetime (UTC if no timezone) | `--valid-until` | ✓ |
| `confirmation_message` | string (nullable) | - | Message after successful payment | `--confirmation-message` | ✓ |
| `payment_methods` | object (nullable) | - | Payment methods configuration | `--payment-methods` | ✓ |
| `custom_fields` | object (nullable) | - | JSON Schema for custom fields | **MISSING** | ✗ |
| `success_redirect_url` | string (nullable) | - | Redirect URL on success (<= 2000 chars) | `--success-redirect-url` | ✓ |
| `failure_redirect_url` | string (nullable) | - | Redirect URL on failure (<= 2000 chars) | `--failure-redirect-url` | ✓ |
| `organization_consumer_id` | string (nullable) | - | Link to existing consumer | `--organization-consumer-id` | ✓ |
| `custom_metadata` | object (nullable) | - | Key-value metadata dictionary | `--custom-metadata` | ✓ |
| `contact_information_type` | enum (nullable) | PHONE | Contact type (PHONE, EMAIL) | `--contact-information-type` | ✓ |

#### payment_methods Object Structure

```json
{
  "visa": false,
  "mastercard": false,
  "amex": false,
  "bank_transfer": false,
  "installment": false
}
```

**Note:** Installments are automatically disabled for recurring products (subscriptions).

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID of the payment link |
| `name` | string | Name |
| `description` | string (nullable) | Description |
| `amount` | string | Total amount after discounts |
| `original_amount` | string | Amount before discounts |
| `item_level_discounted_amount` | string | Item-level discount total |
| `coupon_calculation_metadata` | object | Coupon calculation details |
| `currency` | string | Currency code |
| `home_currency_amount` | string (nullable) | Amount in SAR |
| `exchange_rate_at_creation` | string (nullable) | Exchange rate |
| `max_number_of_payments` | integer (nullable) | Max uses |
| `valid_until` | string (nullable) | Expiry datetime |
| `confirmation_message` | string (nullable) | Success message |
| `recurring_interval` | enum (nullable) | WEEK, MONTH, QUARTER, YEAR |
| `recurring_interval_count` | integer (nullable) | Interval count |
| `status` | enum | INACTIVE, ACTIVE, COMPLETED |
| `organization_id` | string | Organization UUID |
| `user_id` | string | Creator UUID |
| `organization_consumer_id` | string (nullable) | Consumer UUID |
| `deactivate_message` | string (nullable) | Deactivation message |
| `custom_fields` | object (nullable) | Custom fields schema |
| `success_redirect_url` | string (nullable) | Success redirect |
| `failure_redirect_url` | string (nullable) | Failure redirect |
| `custom_metadata` | object (nullable) | Metadata |
| `contact_information_type` | enum (nullable) | PHONE, EMAIL |
| `items` | object[] | List of items with product details |
| `coupons` | object[] | Applied coupons |
| `override_payment_methods` | object | Payment method settings |
| `url` | string | Public payment link URL |
| `amount_collected` | string | Total collected |
| `amount_in_smallest_unit` | integer | Amount in halala |
| `original_amount_in_smallest_unit` | integer | Original in halala |
| `amount_collected_in_smallest_unit` | integer | Collected in halala |
| `created_at` | string | Creation timestamp |
| `updated_at` | string (nullable) | Last update timestamp |

---

## 2. Get Payment Link

**Endpoint:** `GET /api/v2/payment_links/:payment_link_id`

### Required Parameters

| Parameter | Type | Location | Description | CLI Flag | Status |
|-----------|------|----------|-------------|----------|--------|
| `payment_link_id` | uuid | Path | Payment link UUID | `<id>` argument | ✓ |

### Response Fields

Same as Create Payment Link response.

---

## 3. List Payment Links

**Endpoint:** `GET /api/v2/payment_links`

### Required Parameters

None.

### Optional Query Parameters

| Parameter | Type | Default | Description | CLI Flag | Status |
|-----------|------|---------|-------------|----------|--------|
| `statuses` | enum[] | - | Filter by status (INACTIVE, ACTIVE, COMPLETED) | `--statuses` | ✓ |
| `from_date` | date-time | - | Filter from created_at | `--from-date` | ✓ |
| `to_date` | date-time | - | Filter to created_at | `--to-date` | ✓ |
| `from_price` | object | - | Min price (inclusive) | `--from-price` | ✓ |
| `to_price` | object | - | Max price (inclusive) | `--to-price` | ✓ |
| `product_ids` | uuid[] | - | Filter by product UUIDs | `--product-ids` | ✓ |
| `currencies` | string | - | Filter by currencies (e.g. SAR,USD) | `--currencies` | ✓ |
| `page` | integer | 1 | Page number (> 0) | `--page` | ✓ |
| `limit` | integer | 10 | Page size (max 100) | `--limit` | ✓ |
| `sort_field` | string | - | Field to sort by | `--sort-field` | ✓ |
| `sort_direction` | string | - | Sort direction (asc, desc) | `--sort-direction` | ✓ |

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | object[] | Array of payment links |
| `pagination.total_count` | integer | Total records |
| `pagination.max_page` | integer | Max page number |
| `pagination.current_page` | integer | Current page |
| `pagination.limit` | integer | Page size |
| `pagination.has_next_page` | boolean | Has next page |
| `pagination.has_previous_page` | boolean | Has previous page |

---

## 4. Update Payment Link Status

**Endpoint:** `PATCH /api/v2/payment_links/:payment_link_id/status`

### Required Parameters

| Parameter | Type | Location | Description | CLI Flag | Status |
|-----------|------|----------|-------------|----------|--------|
| `payment_link_id` | uuid | Path | Payment link UUID | `<id>` argument | ✓ |

### Request Body Parameters

| Parameter | Type | Required | Description | CLI Flag | Status |
|-----------|------|----------|-------------|----------|--------|
| `status` | enum | Yes | New status (ACTIVE, INACTIVE, COMPLETED) | `--status` | ✓ |
| `deactivate_message` | string | No | Message when deactivated | `--deactivate-message` | ✓ |

### Response Fields

Same as Create Payment Link response.

---

## 5. Current Implementation Gaps

### Gap 1: Missing `--custom-fields` flag in create command

**Location:** `src/commands/checkout.ts:17-35`

**Issue:** The API supports a `custom_fields` parameter (a JSON Schema object for collecting additional information) but the CLI does not expose this option.

**Impact:** Users cannot define custom field schemas when creating payment links via CLI.

**Current flags in create command:**
```typescript
.option('--name <name>', '...')
.option('--items <json>', '...')
.option('--description <text>', '...')
.option('--currency <code>', '...')
.option('--coupons <uuids>', '...')
.option('--max-number-of-payments <n>', '...')
.option('--valid-until <datetime>', '...')
.option('--confirmation-message <msg>', '...')
.option('--payment-methods <json>', '...')
.option('--success-redirect-url <url>', '...')
.option('--failure-redirect-url <url>', '...')
.option('--organization-consumer-id <uuid>', '...')
.option('--custom-metadata <json>', '...')
.option('--contact-information-type <type>', '...')
.option('--data <json>', '...')
.option('--format <format>', '...')
```

**Missing:** `--custom-fields <json>`

---

## 6. Recommended Changes

### File: `src/commands/checkout.ts`

#### Change 1: Add `--custom-fields` flag to create command

**Location:** After line 32 (after `--contact-information-type`)

**Add:**
```typescript
.option('--custom-fields <json>', 'Custom fields JSON Schema for collecting additional information')
```

#### Change 2: Add custom_fields to body construction

**Location:** In the create command action handler, after line 118 (after `contact_information_type` handling)

**Add:**
```typescript
if (options.customFields) {
  body.custom_fields = parseJson(options.customFields);
}
```

---

## 7. Implementation Verification Checklist

After implementing changes:

- [ ] Add `--custom-fields` flag to create command
- [ ] Add body field handling for custom_fields
- [ ] Run `npm run build` to verify TypeScript compilation
- [ ] Test: `node dist/index.js checkout create --help` shows new flag
- [ ] Test: Create payment link with `--custom-fields '{"field1": {"type": "string"}}'`
- [ ] Verify the custom_fields appears in the API response

---

## 8. API Notes

1. **Mixed Products:** Cannot mix one-time and recurring products in the same payment link.

2. **Installments:** Automatically disabled for recurring products (subscriptions).

3. **Currency Conversion:** Non-SAR payment links include `home_currency_amount` and `exchange_rate_at_creation` fields.

4. **Consumer Assignment:** When `organization_consumer_id` is set:
   - Customer information is not collected
   - Payment is for that specific customer only
   - `max_number_of_payments` becomes the limit for that customer

5. **Status Values:**
   - `INACTIVE` - Link not accepting payments
   - `ACTIVE` - Link accepting payments
   - `COMPLETED` - Link has reached its purpose (e.g., max payments reached)
