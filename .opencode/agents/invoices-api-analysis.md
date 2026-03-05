# Invoice API Documentation Analysis

## Summary

**Total Required Parameters Found: 12**

- Create Invoice: 4 body parameters + 6 nested required fields in payment_methods
- Get Invoice: 1 path parameter
- List Invoices: 0 required (all optional query params)
- Update Invoice In Place: 0 required (all optional)
- Send/Accept/Reject/Complete/Cancel: 1 path parameter each

---

## Endpoint: Create Invoice (POST /api/v2/invoices)

### Required Body Parameters (4)
| Parameter | Type | Description |
|-----------|------|-------------|
| `organization_consumer_id` | string | UUID of the consumer who will pay this invoice |
| `scheduled_on` | string | Payment due date. After this date, invoice marked as overdue |
| `items` | array | List of products or services to include in the invoice |
| `payment_methods` | object | Payment methods allowed for this invoice |

### Required Nested Fields in `payment_methods` (6)
| Field | Type | Description |
|-------|------|-------------|
| `mada` | boolean | Enable Mada payment method |
| `visa` | boolean | Enable Visa payment method |
| `mastercard` | boolean | Enable Mastercard payment method |
| `amex` | boolean | Enable American Express payment method |
| `bank_transfer` | boolean | Enable bank transfer payment method |
| `installment` | boolean | Enable installment payment option |

### Required Nested Fields in `items[]` (2)
| Field | Type | Description |
|-------|------|-------------|
| `product_id` | string | UUID of the product to include |
| `quantity` | integer | Quantity of the product |

### Optional Parameters (5)
| Parameter | Type | Description |
|-----------|------|-------------|
| `notify_consumer` | boolean | Send notification to consumer (default: true) |
| `description` | string | Invoice description or notes (max 500 chars) |
| `coupons` | array | List of coupon UUIDs for discounts |
| `exclude_coupons_if_installments` | boolean | Exclude coupons when paying by installments |
| `currency` | string | Currency code (SAR|USD|EUR|GBP|AED|BHD|KWD|OMR|QAR) |

---

## Endpoint: Get Invoice (GET /api/v2/invoices/{invoice_id})

### Required Parameters (1)
| Parameter | Location | Type | Description |
|-----------|----------|------|-------------|
| `invoice_id` | path | string | Unique identifier (UUID) of the invoice |

---

## Endpoint: List Invoices (GET /api/v2/invoices)

### All Optional Query Parameters (16)
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Page size (default: 10, max: 100) |
| `sort_field` | string | Field to sort by (e.g., 'amount', 'scheduled_on') |
| `sort_direction` | string | 'asc' or 'desc' |
| `search_term` | string | Free-text search |
| `include_payments` | boolean | Include payment objects |
| `payment_link_id` | string | Filter by payment link UUID |
| `statuses` | array | Invoice statuses filter |
| `payment_statuses` | array | Payment statuses filter |
| `from_date` | string | Created on/after date |
| `to_date` | string | Created on/before date |
| `due_date_from` | string | Due date from onwards |
| `due_date_to` | string | Due date to or older |
| `from_price` | number | Min total amount |
| `to_price` | number | Max total amount |
| `organization_consumer_id` | string | Filter by consumer UUID |
| `subscription_id` | string | Filter by subscription UUID |
| `currencies` | string | Currency codes (e.g., SAR,USD) |
| `payments_not_settled` | boolean | Only unsettled SUCCEEDED payments |

---

## Endpoint: Update Invoice In Place (PATCH /api/v2/invoices/{invoice_id}/inplace)

### Required Parameters (1)
| Parameter | Location | Type | Description |
|-----------|----------|------|-------------|
| `invoice_id` | path | string | Invoice UUID |

### Optional Body Parameters (2)
| Parameter | Type | Description |
|-----------|------|-------------|
| `scheduled_on` | string | New payment due date (must be future date) |
| `description` | string | Updated description/notes (max 500 chars) |

---

## Other Endpoints (Send, Accept, Reject, Complete, Cancel)

All require only the `invoice_id` path parameter.

---

## Changes Made to src/commands/invoices.ts

### 1. Create Command
- Added "(required)" to descriptions for:
  - `--consumer-id`
  - `--scheduled-on`
  - `--items`
  - `--payment-methods`

### 2. Get Command
- Added "(required)" to `<id>` argument description

### 3. Update Command
- Added "(required)" to `<id>` argument description

### 4. Send Command
- Added "(required)" to `<id>` argument description

### 5. Accept Command
- Added "(required)" to `<id>` argument description

### 6. Reject Command
- Added "(required)" to `<id>` argument description

### 7. Complete Command
- Added "(required)" to `<id>` argument description

### 8. Cancel Command
- Added "(required)" to `<id>` argument description

---

## Gaps Found and Fixed

None - the current implementation already exposes all API parameters correctly. The only change needed was adding "(required)" markers to descriptions for clarity.

---

## Build Verification

Run `npm run build` to verify TypeScript compiles successfully.
