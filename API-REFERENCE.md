# API Reference — CLI Command Mapping

Quick reference mapping CLI commands to official StreamPay API documentation.

## Documentation Base URL
https://docs.streampay.sa

## Getting Started
- **Main Guide**: https://docs.streampay.sa/docs/guides/GETTING_STARTED.md
- **Authentication**: https://docs.streampay.sa/docs/guides/authentication.md
- **Branches**: https://docs.streampay.sa/docs/guides/branches.md
- **Pagination & Filtering**: https://docs.streampay.sa/docs/guides/pagination-and-filtering.md
- **Webhooks**: https://docs.streampay.sa/docs/guides/webhooks.md
- **Error Handling**: https://docs.streampay.sa/docs/guides/ERRORS.md

## API Base URL
```
https://stream-app-service.streampay.sa/api/v2
```

## Consumer Commands

| CLI Command | HTTP | API Endpoint | Documentation |
|---|---|---|---|
| `streampay consumers create` | POST | `/api/v2/consumers` | [Create Consumer](https://docs.streampay.sa/api/v2-consumers-create) |
| `streampay consumers get <id>` | GET | `/api/v2/consumers/:id` | [Get Consumer](https://docs.streampay.sa/api/v2-consumers-get) |
| `streampay consumers list` | GET | `/api/v2/consumers` | [List Consumers](https://docs.streampay.sa/api/v2-consumers-list) |
| `streampay consumers update <id>` | PUT | `/api/v2/consumers/:id` | [Update Consumer](https://docs.streampay.sa/api/v2-consumers-update) |
| `streampay consumers delete <id>` | DELETE | `/api/v2/consumers/:id` | [Delete Consumer](https://docs.streampay.sa/api/v2-consumers-delete) |

### consumers create — Flags
| Flag | API Field | Required | Notes |
|---|---|---|---|
| `--name <name>` | `name` | Yes (unless `--data`) | Consumer name |
| `--phone-number <phone>` | `phone_number` | No | Phone format |
| `--email <email>` | `email` | No | Email format |
| `--external-id <id>` | `external_id` | No | External identifier |
| `--iban <iban>` | `iban` | No | Max 34 chars |
| `--alias <alias>` | `alias` | No | Alias |
| `--comment <text>` | `comment` | No | Comment |
| `--preferred-language <lang>` | `preferred_language` | No | `AR` or `EN` |
| `--communication-methods <methods>` | `communication_methods` | No | Comma-separated: `WHATSAPP,EMAIL,SMS` |
| `--data <json>` | *(body)* | No | Raw JSON body (overrides all flags) |

## Payment Commands

| CLI Command | HTTP | API Endpoint | Documentation |
|---|---|---|---|
| `streampay payments get <id>` | GET | `/api/v2/payments/:id` | [Get Payment](https://docs.streampay.sa/api/v2-payments-get) |
| `streampay payments list` | GET | `/api/v2/payments` | [List Payments](https://docs.streampay.sa/api/v2-payments-list) |
| `streampay payments mark-paid <id>` | POST | `/api/v2/payments/:id/mark-as-paid` | [Mark as Paid](https://docs.streampay.sa/api/v2-payments-mark-paid) |
| `streampay payments refund <id>` | POST | `/api/v2/payments/:id/refund` | [Refund Payment](https://docs.streampay.sa/api/v2-payments-refund) |
| `streampay payments auto-charge <id>` | POST | `/api/v2/payments/auto-charge-on-demand/:id` | [Auto Charge](https://docs.streampay.sa/api/v2-payments-auto-charge-on-demand) |

## Subscription Commands

| CLI Command | HTTP | API Endpoint | Documentation |
|---|---|---|---|
| `streampay subscriptions create` | POST | `/api/v2/subscriptions` | [Create Subscription](https://docs.streampay.sa/api/v2-subscriptions-create) |
| `streampay subscriptions get <id>` | GET | `/api/v2/subscriptions/:id` | [Get Subscription](https://docs.streampay.sa/api/v2-subscriptions-get) |
| `streampay subscriptions list` | GET | `/api/v2/subscriptions` | [List Subscriptions](https://docs.streampay.sa/api/v2-subscriptions-list) |
| `streampay subscriptions update <id>` | PUT | `/api/v2/subscriptions/:id` | [Update Subscription](https://docs.streampay.sa/api/v2-subscriptions-update) |
| `streampay subscriptions cancel <id>` | POST | `/api/v2/subscriptions/:id/cancel` | [Cancel Subscription](https://docs.streampay.sa/api/v2-subscriptions-cancel) |
| `streampay subscriptions freeze <id>` | POST | `/api/v2/subscriptions/:id/freeze` | [Freeze Subscription](https://docs.streampay.sa/api/v2-subscriptions-freeze) |
| `streampay subscriptions unfreeze <id>` | POST | `/api/v2/subscriptions/:id/unfreeze` | [Unfreeze Subscription](https://docs.streampay.sa/api/v2-subscriptions-unfreeze) |
| `streampay subscriptions freezes <id>` | GET | `/api/v2/subscriptions/:id/freeze` | [List Freezes](https://docs.streampay.sa/api/v2-subscriptions-freezes-list) |

Alias: `streampay subs` works as shorthand for `streampay subscriptions`

## Invoice Commands

| CLI Command | HTTP | API Endpoint | Documentation |
|---|---|---|---|
| `streampay invoices create` | POST | `/api/v2/invoices` | [Create Invoice](https://docs.streampay.sa/api/v2-invoices-create) |
| `streampay invoices get <id>` | GET | `/api/v2/invoices/:id` | [Get Invoice](https://docs.streampay.sa/api/v2-invoices-get) |
| `streampay invoices list` | GET | `/api/v2/invoices` | [List Invoices](https://docs.streampay.sa/api/v2-invoices-list) |
| `streampay invoices update <id>` | PATCH | `/api/v2/invoices/:id/inplace` | [Update Invoice](https://docs.streampay.sa/api/v2-invoices-update-in-place) |
| `streampay invoices send <id>` | POST | `/api/v2/invoices/:id/send` | [Send Invoice](https://docs.streampay.sa/api/v2-invoices-send) |
| `streampay invoices accept <id>` | POST | `/api/v2/invoices/:id/accept` | [Accept Invoice](https://docs.streampay.sa/api/v2-invoices-accept) |
| `streampay invoices reject <id>` | POST | `/api/v2/invoices/:id/reject` | [Reject Invoice](https://docs.streampay.sa/api/v2-invoices-reject) |
| `streampay invoices complete <id>` | POST | `/api/v2/invoices/:id/complete` | [Complete Invoice](https://docs.streampay.sa/api/v2-invoices-complete) |
| `streampay invoices cancel <id>` | POST | `/api/v2/invoices/:id/cancel` | [Cancel Invoice](https://docs.streampay.sa/api/v2-invoices-cancel) |

## Product Commands

| CLI Command | HTTP | API Endpoint | Documentation |
|---|---|---|---|
| `streampay products create` | POST | `/api/v2/products` | [Create Product](https://docs.streampay.sa/api/v2-products-create) |
| `streampay products get <id>` | GET | `/api/v2/products/:id` | [Get Product](https://docs.streampay.sa/api/v2-products-get) |
| `streampay products list` | GET | `/api/v2/products` | [List Products](https://docs.streampay.sa/api/v2-products-list) |
| `streampay products update <id>` | PUT | `/api/v2/products/:id` | [Update Product](https://docs.streampay.sa/api/v2-products-update) |
| `streampay products delete <id>` | DELETE | `/api/v2/products/:id` | [Delete Product](https://docs.streampay.sa/api/v2-products-delete) |

## Coupon Commands

| CLI Command | HTTP | API Endpoint | Documentation |
|---|---|---|---|
| `streampay coupons create` | POST | `/api/v2/coupons` | [Create Coupon](https://docs.streampay.sa/api/v2-coupons-create) |
| `streampay coupons get <id>` | GET | `/api/v2/coupons/:id` | [Get Coupon](https://docs.streampay.sa/api/v2-coupons-get) |
| `streampay coupons list` | GET | `/api/v2/coupons` | [List Coupons](https://docs.streampay.sa/api/v2-coupons-list) |
| `streampay coupons update <id>` | PUT | `/api/v2/coupons/:id` | [Update Coupon](https://docs.streampay.sa/api/v2-coupons-update) |
| `streampay coupons delete <id>` | DELETE | `/api/v2/coupons/:id` | [Delete Coupon](https://docs.streampay.sa/api/v2-coupons-delete) |

### coupons create — Flags
| Flag | API Field | Required | Notes |
|---|---|---|---|
| `--name <name>` | `name` | Yes (unless `--data`) | 1–80 chars |
| `--discount-value <value>` | `discount_value` | Yes (unless `--data`) | Number or string |
| `--is-percentage <bool>` | `is_percentage` | No | `true` or `false`. Default: `false` |
| `--currency <code>` | `currency` | No* | Required when `is_percentage=false`. Null when `is_percentage=true`. SAR/USD/EUR/GBP/AED/BHD/KWD/OMR/QAR |
| `--is-active <bool>` | `is_active` | No | Default: `true` |
| `--data <json>` | *(body)* | No | Raw JSON body (overrides all flags) |

## Checkout / Payment Link Commands

| CLI Command | HTTP | API Endpoint | Documentation |
|---|---|---|---|
| `streampay checkout create` | POST | `/api/v2/payment_links` | [Create Payment Link](https://docs.streampay.sa/api/v2-payment-links-create) |
| `streampay checkout get <id>` | GET | `/api/v2/payment_links/:id` | [Get Payment Link](https://docs.streampay.sa/api/v2-payment-links-get) |
| `streampay checkout list` | GET | `/api/v2/payment_links` | [List Payment Links](https://docs.streampay.sa/api/v2-payment-links-list) |
| `streampay checkout activate <id>` | PATCH | `/api/v2/payment_links/:id/status` | [Update Status](https://docs.streampay.sa/api/v2-payment-links-update-status) |
| `streampay checkout deactivate <id>` | PATCH | `/api/v2/payment_links/:id/status` | [Update Status](https://docs.streampay.sa/api/v2-payment-links-update-status) |
| `streampay checkout update-status <id>` | PATCH | `/api/v2/payment_links/:id/status` | [Update Status](https://docs.streampay.sa/api/v2-payment-links-update-status) |

### checkout create — Flags
| Flag | API Field | Required | Notes |
|---|---|---|---|
| `--name <name>` | `name` | Yes (unless `--data`) | Payment link name |
| `--items <json>` | `items` | Yes (unless `--data`) | JSON array: `[{"product_id":"uuid","quantity":1}]` |
| `--description <text>` | `description` | No | Optional description |
| `--currency <code>` | `currency` | No | Default: `SAR`. SAR/USD/EUR/GBP/AED/BHD/KWD/OMR/QAR |
| `--coupons <uuids>` | `coupons` | No | Comma-separated coupon UUIDs |
| `--max-number-of-payments <n>` | `max_number_of_payments` | No | Max uses (null = unlimited) |
| `--valid-until <datetime>` | `valid_until` | No | ISO 8601 datetime |
| `--confirmation-message <msg>` | `confirmation_message` | No | Shown after payment |
| `--payment-methods <json>` | `payment_methods` | No | `{"visa":true,"mastercard":true,"amex":false,...}` |
| `--success-redirect-url <url>` | `success_redirect_url` | No | Max 2000 chars |
| `--failure-redirect-url <url>` | `failure_redirect_url` | No | Max 2000 chars |
| `--organization-consumer-id <uuid>` | `organization_consumer_id` | No | Pre-fill consumer |
| `--custom-metadata <json>` | `custom_metadata` | No | Key-value metadata |
| `--contact-information-type <type>` | `contact_information_type` | No | `PHONE` or `EMAIL` |
| `--data <json>` | *(body)* | No | Raw JSON body (overrides all flags) |

### checkout list — Filter Flags
| Flag | Query Param | Notes |
|---|---|---|
| `--statuses <statuses>` | `statuses` | Comma-separated: `ACTIVE,INACTIVE,COMPLETED` |
| `--from-date <datetime>` | `from_date` | ISO 8601 |
| `--to-date <datetime>` | `to_date` | ISO 8601 |
| `--from-price <n>` | `from_price` | Min amount |
| `--to-price <n>` | `to_price` | Max amount |
| `--product-ids <uuids>` | `product_ids` | Comma-separated UUIDs |
| `--currencies <codes>` | `currencies` | Comma-separated e.g. `SAR,USD` |

## Webhook Commands

| CLI Command | Description |
|---|---|
| `streampay webhooks events` | List all supported webhook event types |
| `streampay webhooks verify` | Verify a webhook signature |

## Configuration Commands

| CLI Command | Description |
|---|---|
| `streampay config set --api-key <key>` | Set API key |
| `streampay config set --branch <branch>` | Set default branch |
| `streampay config set --base-url <url>` | Set API base URL |
| `streampay config get` | View current configuration |
| `streampay config clear` | Clear all configuration |
| `streampay config path` | Show config file path |

## Authentication

All API requests require an API key:

```bash
# Via CLI config (persistent)
streampay config set --api-key YOUR_API_KEY

# Via environment variable
export STREAMPAY_API_KEY=your_api_key

# Via .env file
STREAMPAY_API_KEY=your_api_key
```

## SDKs

- **TypeScript SDK**: https://docs.streampay.sa/sdks/typescript.md
- **Express SDK**: https://docs.streampay.sa/sdks/express.md

## Testing

- **Testing Cards**: https://docs.streampay.sa/docs/guides/testing-cards.md
- **Installments**: https://docs.streampay.sa/docs/guides/installments.md
