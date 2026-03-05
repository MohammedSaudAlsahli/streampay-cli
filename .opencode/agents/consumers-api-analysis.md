# Consumers API Documentation Analysis

**Generated:** 2026-03-05  
**Source:** StreamPay OpenAPI Specification (v2)  
**Analyzed Endpoints:** 5

---

## 1. Create Consumer

**Endpoint:** `POST /api/v2/consumers`  
**Description:** Create a new consumer with contact information and payment details.

### Required Parameters

| Parameter | Type | Description | CLI Flag | Status |
|-----------|------|-------------|----------|--------|
| `name` | string | Consumer name | `--name <name>` | ✓ |

### Optional Parameters

| Parameter | Type | Constraints | Description | CLI Flag | Status |
|-----------|------|-------------|-------------|----------|--------|
| `phone_number` | string | format: phone | Phone number | `--phone-number <phone>` | ✓ |
| `email` | string | format: email | Email address | `--email <email>` | ✓ |
| `external_id` | string | nullable | External ID | `--external-id <id>` | ✓ |
| `iban` | string | maxLength: 34, nullable | IBAN | `--iban <iban>` | ✓ |
| `alias` | string | nullable | Alias | `--alias <alias>` | ✓ |
| `comment` | string | nullable | Comment | `--comment <comment>` | ✓ |
| `preferred_language` | string | enum: `AR`, `EN`, nullable | Preferred language | `--preferred-language <lang>` | ✓ |
| `communication_methods` | array | enum: `WHATSAPP`, `EMAIL`, `SMS`, nullable | Communication methods | `--communication-methods <methods>` | ✓ |

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique identifier of the consumer |
| `name` | string | Name of the consumer |
| `phone_number` | string (nullable) | Phone number of the consumer |
| `email` | string (nullable) | Email address of the consumer |
| `external_id` | string (nullable) | External identifier for the consumer |
| `iban` | string (nullable) | IBAN of the consumer |
| `alias` | string (nullable) | Alias of the consumer |
| `comment` | string (nullable) | Additional comments |
| `preferred_language` | string | Preferred language |
| `communication_methods` | array | Preferred communication methods |
| `is_deleted` | boolean | Whether the consumer has been deleted |
| `created_at` | string (date-time) | Creation timestamp |
| `branch` | object | Branch information |
| `last_invoice_activity` | object (nullable) | Last invoice activity info |

---

## 2. Get Consumer

**Endpoint:** `GET /api/v2/consumers/{consumer_id}`  
**Description:** Retrieve detailed information about a specific consumer by their ID.

### Required Parameters

| Parameter | Type | Location | Description | CLI Implementation | Status |
|-----------|------|----------|-------------|-------------------|--------|
| `consumer_id` | string (UUID) | path | Unique identifier of the consumer | Positional argument `<id>` | ✓ |

### Optional Parameters

None.

### Response

Returns `ConsumerResponse` object (see section 1).

---

## 3. List Consumers

**Endpoint:** `GET /api/v2/consumers`  
**Description:** List all consumers with pagination, filtering, and sorting options.

### Required Parameters

None.

### Optional Parameters (Query)

| Parameter | Type | Default | Constraints | Description | CLI Flag | Status |
|-----------|------|---------|-------------|-------------|----------|--------|
| `page` | integer | 1 | exclusiveMinimum: 0 | Page number | `--page <number>` | ✓ |
| `limit` | integer | 10 | exclusiveMinimum: 0, max: 100 | Results per page | `--limit <number>` | ✓ |
| `search_term` | string | null | nullable | Search term to filter | `--search <term>` | ✓ |
| `sort_field` | string | null | nullable | Field to sort by | `--sort-field <field>` | ✓ |
| `sort_direction` | string | null | `'asc'` or `'desc'` | Sort direction | `--sort-direction <direction>` | ✓ |

### Response

Returns paginated list of `ConsumerResponse` objects.

---

## 4. Update Consumer

**Endpoint:** `PUT /api/v2/consumers/{consumer_id}`  
**Description:** Update consumer information such as contact details or payment methods.

### Required Parameters

| Parameter | Type | Location | Description | CLI Implementation | Status |
|-----------|------|----------|-------------|-------------------|--------|
| `consumer_id` | string (UUID) | path | Unique identifier of the consumer | Positional argument `<id>` | ✓ |

### Optional Parameters (Body)

All fields from `ConsumerUpdate` schema are optional:

| Parameter | Type | Constraints | Description | CLI Flag | Status |
|-----------|------|-------------|-------------|----------|--------|
| `name` | string | nullable | Consumer name | `--name <name>` | ✓ |
| `phone_number` | string | format: phone, nullable | Phone number | `--phone-number <phone>` | ✓ |
| `email` | string | format: email, nullable | Email address | `--email <email>` | ✓ |
| `external_id` | string | nullable | External ID | `--external-id <id>` | ✓ |
| `iban` | string | maxLength: 34, nullable | IBAN | `--iban <iban>` | ✓ |
| `alias` | string | nullable | Alias | `--alias <alias>` | ✓ |
| `comment` | string | nullable | Comment | `--comment <comment>` | ✓ |
| `preferred_language` | string | nullable | Preferred language | `--preferred-language <lang>` | ✓ |
| `communication_methods` | array | nullable | Communication methods | `--communication-methods <methods>` | ✓ |

### Response

Returns updated `ConsumerResponse` object.

---

## 5. Delete Consumer

**Endpoint:** `DELETE /api/v2/consumers/{consumer_id}`  
**Description:** Delete a consumer from the organization.

### Required Parameters

| Parameter | Type | Location | Description | CLI Implementation | Status |
|-----------|------|----------|-------------|-------------------|--------|
| `consumer_id` | string (UUID) | path | Unique identifier of the consumer | Positional argument `<id>` | ✓ |

### Optional Parameters

None.

### Response

Returns success confirmation.

---

## 6. Current Implementation Gaps

### Summary

| Endpoint | Required Params | Optional Params | CLI Coverage | Gaps |
|----------|-----------------|-----------------|--------------|------|
| Create Consumer | 1 | 8 | 9/9 (100%) | 0 |
| Get Consumer | 1 | 0 | 1/1 (100%) | 0 |
| List Consumers | 0 | 5 | 5/5 (100%) | 0 |
| Update Consumer | 1 | 9 | 10/10 (100%) | 0 |
| Delete Consumer | 1 | 0 | 1/1 (100%) | 0 |

**Total Gaps Found: 0**

### Detailed Gap Analysis

#### Create Consumer
- ✅ All required parameters are implemented
- ✅ All optional parameters are implemented
- ✅ Validation for `preferred_language` (AR, EN) is correct
- ✅ Validation for `communication_methods` (WHATSAPP, EMAIL, SMS) is correct
- ✅ `--data` flag allows raw JSON override

#### Get Consumer
- ✅ `consumer_id` is correctly implemented as positional argument

#### List Consumers
- ✅ All pagination parameters are implemented
- ✅ Search term correctly maps to `search_term` API parameter
- ✅ Sort options are implemented

#### Update Consumer
- ✅ All parameters are correctly optional
- ✅ Validation requires at least one field when not using `--data`
- ✅ All field validations match the API

#### Delete Consumer
- ✅ `consumer_id` is correctly implemented as positional argument

---

## 7. Implementation Quality Assessment

### Strengths

1. **Complete Coverage:** All API parameters are exposed via CLI flags
2. **Proper Validation:** Enum values for `preferred_language` and `communication_methods` are validated
3. **Flexible Input:** `--data` flag allows raw JSON input for complex use cases
4. **Consistent Naming:** CLI flags follow kebab-case convention, correctly converted to snake_case for API
5. **Error Handling:** All commands follow the required error handling pattern with `process.exit(1)`

### No Changes Required

The current implementation in `src/commands/consumers.ts` is **complete and correct**. All API parameters are properly exposed and validated.

---

## 8. Enum Reference

### Language (`preferred_language`)
| Value | Description |
|-------|-------------|
| `AR` | Arabic |
| `EN` | English |

### Communication Method (`communication_methods`)
| Value | Description |
|-------|-------------|
| `WHATSAPP` | WhatsApp messaging |
| `EMAIL` | Email |
| `SMS` | SMS text messaging |

---

## Summary

| Metric | Value |
|--------|-------|
| Endpoints Analyzed | 5 |
| Total Required Parameters | 4 |
| Total Optional Parameters | 22 |
| Parameters Implemented | 26/26 (100%) |
| Gaps Identified | 0 |

**Conclusion:** The CLI implementation fully covers the StreamPay Consumers API with no gaps or missing parameters.
