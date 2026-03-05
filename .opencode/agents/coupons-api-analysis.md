# Coupons API Documentation Analysis

## Summary
Analysis of StreamPay API documentation for coupons endpoints.

---

## 1. Create Coupon (POST /api/v2/coupons)

### Required Parameters (2)
| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string (1-80 chars) | Name of the coupon |
| `discount_value` | number or string | Discount value (percentage or fixed) |

### Optional Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `is_percentage` | boolean | false | True = percentage, false = fixed amount |
| `currency` | string | null | Currency code for fixed-amount coupons |
| `is_active` | boolean | true | Whether coupon is active on creation |

---

## 2. Get Coupon (GET /api/v2/coupons/{coupon_id})

### Required Parameters (1)
| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `coupon_id` | string | path | Coupon ID |

### Optional Parameters
None

---

## 3. List Coupons (GET /api/v2/coupons)

### Required Parameters
None

### Optional Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `search_term` | string | Search by coupon name |
| `active` | boolean | Filter by active status |
| `is_percentage` | boolean | Filter by discount type |
| `sort_field` | string | Field to sort by |
| `sort_direction` | string | Sort direction (asc/desc) |

---

## 4. Update Coupon (PUT /api/v2/coupons/{coupon_id})

### Required Parameters (1)
| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `coupon_id` | string | path | Coupon ID |

### Optional Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Updated name |
| `discount_value` | number/string | Updated discount value |
| `currency` | string | Currency code |
| `is_percentage` | boolean | Discount type |
| `is_active` | boolean | Active status |

---

## 5. Delete Coupon (DELETE /api/v2/coupons/{coupon_id})

### Required Parameters (1)
| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `coupon_id` | string | path | Coupon ID |

### Optional Parameters
None

---

## Total Required Parameters: 5

- Create: 2 body params (`name`, `discount_value`)
- Get: 1 path param (`coupon_id`)
- Update: 1 path param (`coupon_id`)
- Delete: 1 path param (`coupon_id`)
- List: 0

---

## Changes Made to coupons.ts

### Create Command
- Changed `--name` from `.option()` to `.requiredOption()`
- Changed `--discount-value` from `.option()` to `.requiredOption()`
- Added "(required)" to descriptions for these flags
- Removed manual validation checks (now handled by Commander)

### Get Command
- Added "(required)" to argument description

### Update Command
- Added "(required)" to argument description

### Delete Command
- Added "(required)" to argument description

### List Command
- No changes needed (all params are optional)

---

## Gaps Found and Fixed

1. **Create command required flags**: Previously used manual validation in action handler. Now uses Commander's `.requiredOption()` which provides better UX with automatic error messages.

2. **Argument descriptions**: Path parameters now clearly marked as required in help text.
