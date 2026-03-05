import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, parseJson } from '../../utils';

const VALID_CURRENCIES = ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'BHD', 'KWD', 'OMR', 'QAR'];

export function registerCreateCommand(invoice: Command): void {
  invoice
    .command('create')
    .description('Create a new invoice')
    .requiredOption('--consumer-id <uuid>', 'Consumer UUID (organization_consumer_id)')
    .requiredOption('--scheduled-on <datetime>', 'Payment due date (ISO 8601, e.g. 2026-04-01T00:00:00Z)')
    .requiredOption('--items <json>', 'Items as JSON array, e.g. \'[{"product_id":"uuid","quantity":1}]\'')
    .requiredOption('--payment-methods <json>', 'Payment methods as JSON object, e.g. \'{"mada":true,"visa":true,"mastercard":true,"amex":false,"bank_transfer":false,"installment":false,"qurrah":false}\'')
    .option('--description <text>', 'Invoice description (max 500 chars)')
    .option('--notify-consumer', 'Send notification to consumer (default: true)')
    .option('--no-notify-consumer', 'Do not send notification to consumer')
    .option('--coupons <json>', 'Invoice-level coupon UUIDs as JSON array, e.g. \'["uuid1","uuid2"]\'')
    .option('--exclude-coupons-if-installments', 'Exclude coupons when consumer pays by installments')
    .option('--currency <code>', 'Currency code (SAR|USD|EUR|GBP|AED|BHD|KWD|OMR|QAR)', 'SAR')
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

        const items = parseJson(options.items);

        const paymentMethods = parseJson(options.paymentMethods);

        const data: any = {
          organization_consumer_id: options.consumerId,
          scheduled_on: options.scheduledOn,
          items,
          payment_methods: paymentMethods,
        };

        if (options.description) {
          data.description = options.description;
        }
        if (options.notifyConsumer === false) {
          data.notify_consumer = false;
        }
        if (options.coupons) {
          data.coupons = parseJson(options.coupons);
        }
        if (options.excludeCouponsIfInstallments) {
          data.exclude_coupons_if_installments = true;
        }
        if (options.currency) {
          if (!VALID_CURRENCIES.includes(options.currency.toUpperCase())) {
            throw new Error(`Invalid currency "${options.currency}". Must be one of: ${VALID_CURRENCIES.join(', ')}`);
          }
          data.currency = options.currency.toUpperCase();
        }

        const result = await client.createInvoice(data);
        OutputFormatter.success('Invoice created successfully');
        if (options.pretty) {
          OutputFormatter.outputInvoiceDetail(result);
        } else {
          OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
        }
      } catch (error) {
        OutputFormatter.error('Failed to create invoice', error);
        process.exit(1);
      }
    });
}
