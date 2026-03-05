import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, parseJson } from '../../utils';

const VALID_CURRENCIES = ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'BHD', 'KWD', 'OMR', 'QAR'];
const VALID_CONTACT_INFO_TYPES = ['PHONE', 'EMAIL'];

export function createCheckoutCreateCommand(): Command {
  const command = new Command('create')
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
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format')
    .option('--pretty', 'output in pretty format (default)')
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
        if (options.pretty) {
          OutputFormatter.outputCheckoutDetail(result);
        } else {
          OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
        }
      } catch (error) {
        OutputFormatter.error('Failed to create payment link', error);
        process.exit(1);
      }
    });

  return command;
}
