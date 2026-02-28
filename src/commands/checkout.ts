import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter, parseJson } from '../utils';

const VALID_CURRENCIES = ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'BHD', 'KWD', 'OMR', 'QAR'];
const VALID_CONTACT_INFO_TYPES = ['PHONE', 'EMAIL'];
const VALID_STATUSES = ['ACTIVE', 'INACTIVE', 'COMPLETED'];

export function createCheckoutCommands(): Command {
  const checkout = new Command('checkout')
    .description('Manage payment links (checkout)');

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  checkout
    .command('create')
    .description('Create a new payment link')
    .option('--name <name>', 'Payment link name (required unless --data is used)')
    .option('--items <json>', 'Items array as JSON (required unless --data is used), e.g. \'[{"product_id":"uuid","quantity":1}]\'')
    .option('--description <text>', 'Payment link description')
    .option('--currency <code>', 'Currency code (SAR|USD|EUR|GBP|AED|BHD|KWD|OMR|QAR)')
    .option('--coupons <uuids>', 'Comma-separated coupon UUIDs')
    .option('--max-number-of-payments <n>', 'Maximum number of payments (integer)')
    .option('--valid-until <datetime>', 'Expiry date-time string')
    .option('--confirmation-message <msg>', 'Message shown after payment confirmation')
    .option('--payment-methods <json>', 'Payment methods object as JSON, e.g. \'{"visa":true,"mastercard":true}\'')
    .option('--success-redirect-url <url>', 'URL to redirect on successful payment')
    .option('--failure-redirect-url <url>', 'URL to redirect on failed payment')
    .option('--organization-consumer-id <uuid>', 'Organization consumer UUID')
    .option('--custom-metadata <json>', 'Custom metadata as JSON object')
    .option('--contact-information-type <type>', 'Contact information type (PHONE|EMAIL)')
    .option('--data <json>', 'Raw JSON body (skips all flag logic)')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        let body: any;

        if (options.data) {
          body = parseJson(options.data);
        } else {
          if (!options.name) {
            throw new Error('--name is required when not using --data');
          }
          if (!options.items) {
            throw new Error('--items is required when not using --data (JSON array of item objects, each with product_id)');
          }

          const parsedItems = parseJson(options.items);
          if (!Array.isArray(parsedItems)) {
            throw new Error('--items must be a JSON array');
          }
          for (const item of parsedItems) {
            if (!item.product_id) {
              throw new Error('Each item in --items must have a product_id');
            }
          }

          if (options.currency && !VALID_CURRENCIES.includes(options.currency)) {
            throw new Error(
              `Invalid currency "${options.currency}". Must be one of: ${VALID_CURRENCIES.join(', ')}`,
            );
          }

          if (options.contactInformationType && !VALID_CONTACT_INFO_TYPES.includes(options.contactInformationType)) {
            throw new Error(
              `Invalid contact information type "${options.contactInformationType}". Must be one of: ${VALID_CONTACT_INFO_TYPES.join(', ')}`,
            );
          }

          body = {
            name: options.name,
            items: parsedItems,
          };

          if (options.description !== undefined) {
            body.description = options.description;
          }
          if (options.currency) {
            body.currency = options.currency;
          }
          if (options.coupons) {
            body.coupons = options.coupons.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
          if (options.maxNumberOfPayments !== undefined) {
            body.max_number_of_payments = parseInt(options.maxNumberOfPayments, 10);
          }
          if (options.validUntil !== undefined) {
            body.valid_until = options.validUntil;
          }
          if (options.confirmationMessage !== undefined) {
            body.confirmation_message = options.confirmationMessage;
          }
          if (options.paymentMethods) {
            body.payment_methods = parseJson(options.paymentMethods);
          }
          if (options.successRedirectUrl !== undefined) {
            body.success_redirect_url = options.successRedirectUrl;
          }
          if (options.failureRedirectUrl !== undefined) {
            body.failure_redirect_url = options.failureRedirectUrl;
          }
          if (options.organizationConsumerId !== undefined) {
            body.organization_consumer_id = options.organizationConsumerId;
          }
          if (options.customMetadata) {
            body.custom_metadata = parseJson(options.customMetadata);
          }
          if (options.contactInformationType !== undefined) {
            body.contact_information_type = options.contactInformationType;
          }
        }

        const result = await client.createPaymentLink(body);
        OutputFormatter.success('Payment link created successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to create payment link', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // get
  // ---------------------------------------------------------------------------
  checkout
    .command('get')
    .description('Get a payment link by ID')
    .argument('<id>', 'Payment link ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.getPaymentLink(id);
        OutputFormatter.success('Payment link retrieved successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to get payment link', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // list
  // ---------------------------------------------------------------------------
  checkout
    .command('list')
    .description('List payment links')
    .option('--page <n>', 'Page number', parseInt)
    .option('--limit <n>', 'Results per page (max 100)', parseInt)
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <dir>', 'Sort direction (asc|desc)')
    .option('--statuses <statuses>', 'Comma-separated statuses (ACTIVE,INACTIVE,COMPLETED)')
    .option('--from-date <datetime>', 'Filter from date-time')
    .option('--to-date <datetime>', 'Filter to date-time')
    .option('--from-price <n>', 'Filter from price')
    .option('--to-price <n>', 'Filter to price')
    .option('--product-ids <uuids>', 'Comma-separated product UUIDs')
    .option('--currencies <codes>', 'Comma-separated currency codes (e.g. SAR,USD)')
    .option('--format <format>', 'Output format (json|table|pretty)', 'table')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        OutputFormatter.info('Listing payment links...');

        const params: any = {};

        if (options.page !== undefined) params.page = options.page;
        if (options.limit !== undefined) params.limit = options.limit;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) params.sort_direction = options.sortDirection;

        if (options.statuses) {
          const statusList = options.statuses.split(',').map((s: string) => s.trim()).filter(Boolean);
          for (const s of statusList) {
            if (!VALID_STATUSES.includes(s)) {
              throw new Error(
                `Invalid status "${s}". Must be one of: ${VALID_STATUSES.join(', ')}`,
              );
            }
          }
          params.statuses = statusList;
        }

        if (options.fromDate) params.from_date = options.fromDate;
        if (options.toDate) params.to_date = options.toDate;
        if (options.fromPrice !== undefined) params.from_price = options.fromPrice;
        if (options.toPrice !== undefined) params.to_price = options.toPrice;

        if (options.productIds) {
          params.product_ids = options.productIds.split(',').map((s: string) => s.trim()).filter(Boolean);
        }

        if (options.currencies) params.currencies = options.currencies;

        const result = await client.listPaymentLinks(params);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to list payment links', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // activate
  // ---------------------------------------------------------------------------
  checkout
    .command('activate')
    .description('Activate a payment link')
    .argument('<id>', 'Payment link ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.updatePaymentLinkStatus(id, { status: 'ACTIVE' });
        OutputFormatter.success('Payment link activated successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to activate payment link', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // deactivate
  // ---------------------------------------------------------------------------
  checkout
    .command('deactivate')
    .description('Deactivate a payment link')
    .argument('<id>', 'Payment link ID')
    .option('--deactivate-message <msg>', 'Optional message shown when link is deactivated')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const body: any = { status: 'INACTIVE' };
        if (options.deactivateMessage !== undefined) {
          body.deactivate_message = options.deactivateMessage;
        }

        const result = await client.updatePaymentLinkStatus(id, body);
        OutputFormatter.success('Payment link deactivated successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to deactivate payment link', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // update-status
  // ---------------------------------------------------------------------------
  checkout
    .command('update-status')
    .description('Update the status of a payment link')
    .argument('<id>', 'Payment link ID')
    .option('--status <status>', 'New status (ACTIVE|INACTIVE|COMPLETED)')
    .option('--deactivate-message <msg>', 'Optional deactivation message')
    .option('--data <json>', 'Raw JSON body (skips flag logic)')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        let body: any;

        if (options.data) {
          body = parseJson(options.data);
        } else {
          if (!options.status) {
            throw new Error('--status is required when not using --data. Must be one of: ACTIVE, INACTIVE, COMPLETED');
          }
          if (!VALID_STATUSES.includes(options.status)) {
            throw new Error(
              `Invalid status "${options.status}". Must be one of: ${VALID_STATUSES.join(', ')}`,
            );
          }

          body = { status: options.status };
          if (options.deactivateMessage !== undefined) {
            body.deactivate_message = options.deactivateMessage;
          }
        }

        const result = await client.updatePaymentLinkStatus(id, body);
        OutputFormatter.success('Payment link status updated successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to update payment link status', error);
        process.exit(1);
      }
    });

  return checkout;
}
