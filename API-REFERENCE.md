# API Reference - CLI Command Mapping

Quick reference mapping CLI commands to official Stream Pay API documentation.

## Documentation Base URL
https://docs.streampay.sa

## Getting Started
- **Main Guide**: https://docs.streampay.sa/docs/guides/GETTING_STARTED.md
- **Authentication**: https://docs.streampay.sa/docs/guides/authentication.md
- **Branches**: https://docs.streampay.sa/docs/guides/branches.md
- **Pagination & Filtering**: https://docs.streampay.sa/docs/guides/pagination-and-filtering.md
- **Webhooks**: https://docs.streampay.sa/docs/guides/webhooks.md
- **Error Handling**: https://docs.streampay.sa/docs/guides/ERRORS.md

## Consumer Commands

| CLI Command | API Documentation |
|-------------|-------------------|
| `streampay consumer create` | [Create Consumer](https://docs.streampay.sa/docs/api/v2-consumers-create.md) |
| `streampay consumer get <id>` | [Get Consumer](https://docs.streampay.sa/docs/api/v2-consumers-get.md) |
| `streampay consumer list` | [List Consumers](https://docs.streampay.sa/docs/api/v2-consumers-list.md) |
| `streampay consumer update <id>` | [Update Consumer](https://docs.streampay.sa/docs/api/v2-consumers-update.md) |
| `streampay consumer delete <id>` | [Delete Consumer](https://docs.streampay.sa/docs/api/v2-consumers-delete.md) |

## Payment Commands

| CLI Command | API Documentation |
|-------------|-------------------|
| `streampay payment get <id>` | [Get Payment](https://docs.streampay.sa/docs/api/v2-payments-get.md) |
| `streampay payment list` | [List Payments](https://docs.streampay.sa/docs/api/v2-payments-list.md) |
| `streampay payment mark-paid <id>` | [Mark Payment as Paid](https://docs.streampay.sa/docs/api/v2-payments-mark-paid.md) |
| `streampay payment refund <id>` | [Refund Payment](https://docs.streampay.sa/docs/api/v2-payments-refund.md) |
| `streampay payment auto-charge <consumer-id>` | [Auto Charge On Demand](https://docs.streampay.sa/docs/api/v2-payments-auto-charge-on-demand.md) |

## Subscription Commands

| CLI Command | API Documentation |
|-------------|-------------------|
| `streampay subscription create` | [Create Subscription](https://docs.streampay.sa/docs/api/v2-subscriptions-create.md) |
| `streampay subscription get <id>` | [Get Subscription](https://docs.streampay.sa/docs/api/v2-subscriptions-get.md) |
| `streampay subscription list` | [List Subscriptions](https://docs.streampay.sa/docs/api/v2-subscriptions-list.md) |
| `streampay subscription update <id>` | [Update Subscription](https://docs.streampay.sa/docs/api/v2-subscriptions-update.md) |
| `streampay subscription cancel <id>` | [Cancel Subscription](https://docs.streampay.sa/docs/api/v2-subscriptions-cancel.md) |
| `streampay subscription freeze <id>` | [Freeze Subscription](https://docs.streampay.sa/docs/api/v2-subscriptions-freeze.md) |
| `streampay subscription freezes <id>` | [List Subscription Freezes](https://docs.streampay.sa/docs/api/v2-subscriptions-freezes-list.md) |

## Invoice Commands

| CLI Command | API Documentation |
|-------------|-------------------|
| `streampay invoice create` | [Create Invoice](https://docs.streampay.sa/docs/api/v2-invoices-create.md) |
| `streampay invoice get <id>` | [Get Invoice](https://docs.streampay.sa/docs/api/v2-invoices-get.md) |
| `streampay invoice list` | [List Invoices](https://docs.streampay.sa/docs/api/v2-invoices-list.md) |
| `streampay invoice update <id>` | [Update Invoice In Place](https://docs.streampay.sa/docs/api/v2-invoices-update-in-place.md) |

## Product Commands

| CLI Command | API Documentation |
|-------------|-------------------|
| `streampay product create` | [Create Product](https://docs.streampay.sa/docs/api/v2-products-create.md) |
| `streampay product get <id>` | [Get Product](https://docs.streampay.sa/docs/api/v2-products-get.md) |
| `streampay product list` | [List Products](https://docs.streampay.sa/docs/api/v2-products-list.md) |
| `streampay product update <id>` | [Update Product](https://docs.streampay.sa/docs/api/v2-products-update.md) |
| `streampay product delete <id>` | [Delete Product](https://docs.streampay.sa/docs/api/v2-products-delete.md) |

## Coupon Commands

| CLI Command | API Documentation |
|-------------|-------------------|
| `streampay coupon create` | [Create Coupon](https://docs.streampay.sa/docs/api/v2-coupons-create.md) |
| `streampay coupon get <id>` | [Get Coupon](https://docs.streampay.sa/docs/api/v2-coupons-get.md) |
| `streampay coupon list` | [List Coupons](https://docs.streampay.sa/docs/api/v2-coupons-list.md) |
| `streampay coupon update <id>` | [Update Coupon](https://docs.streampay.sa/docs/api/v2-coupons-update.md) |
| `streampay coupon delete <id>` | [Delete Coupon](https://docs.streampay.sa/docs/api/v2-coupons-delete.md) |

## Payment Link Commands

| CLI Command | API Documentation |
|-------------|-------------------|
| `streampay payment-link create` | [Create Payment Link](https://docs.streampay.sa/docs/api/v2-payment-links-create.md) |
| `streampay payment-link get <id>` | [Get Payment Link](https://docs.streampay.sa/docs/api/v2-payment-links-get.md) |
| `streampay payment-link list` | [List Payment Links](https://docs.streampay.sa/docs/api/v2-payment-links-list.md) |
| `streampay payment-link update-status <id>` | [Update Payment Link Status](https://docs.streampay.sa/docs/api/v2-payment-links-update-status.md) |

## Other Commands

| CLI Command | API Documentation |
|-------------|-------------------|
| `streampay whoami` | [Get User And Organization Info](https://docs.streampay.sa/docs/api/v2-me-get.md) |

## Quick Access via CLI

Use the built-in docs command to quickly access documentation:

```bash
# View main documentation
streampay docs

# View specific topic
streampay docs consumers
streampay docs payments
streampay docs subscriptions
streampay docs auth
streampay docs webhooks

# View guides
streampay docs getting-started
streampay docs branches
streampay docs pagination
streampay docs errors
```

## SDKs

For direct SDK usage instead of CLI:
- **TypeScript SDK**: https://docs.streampay.sa/sdks/typescript.md
- **Express SDK**: https://docs.streampay.sa/sdks/express.md

## API Base URL

```
https://stream-app-service.streampay.sa/api/v2
```

Configure in CLI:
```bash
streampay config set --base-url https://stream-app-service.streampay.sa/api/v2
```

## Authentication

All API requests require an API key. Set it up:

```bash
# Via CLI config
streampay config set --api-key YOUR_API_KEY

# Via environment variable
export STREAMPAY_API_KEY=your_api_key

# Via .env file
echo "STREAMPAY_API_KEY=your_api_key" > .env
```

See [Authentication Guide](https://docs.streampay.sa/docs/guides/authentication.md) for details.

## Branches

API requests are scoped to branches. Configure:

```bash
streampay config set --branch production
# or
streampay config set --branch staging
```

See [Branches Guide](https://docs.streampay.sa/docs/guides/branches.md) for details.

## Testing

- **Testing Cards**: https://docs.streampay.sa/docs/guides/testing-cards.md
- **Installments**: https://docs.streampay.sa/docs/guides/installments.md

## Support

For additional help:
- Documentation: https://docs.streampay.sa
- Error reference: https://docs.streampay.sa/docs/guides/ERRORS.md
- Webhook setup: https://docs.streampay.sa/docs/guides/webhooks.md
