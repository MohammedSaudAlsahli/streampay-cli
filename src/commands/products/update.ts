import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, parseJson } from '../../utils';

export function createProductUpdateCommand(): Command {
  return new Command('update')
    .description('Update a product')
    .argument('<id>', 'Product ID')
    .option('-n, --name <name>', 'Product name')
    .option('-t, --type <type>', 'Product type: RECURRING or ONE_OFF')
    .option('--prices <json>', 'Prices array as JSON (e.g. \'[{"currency":"SAR","amount":299}]\') — preferred over --price/--currency')
    .option('-p, --price <price>', 'Legacy single price (deprecated; prefer --prices)', parseFloat)
    .option('-c, --currency <currency>', 'Legacy currency code (deprecated; prefer --prices)')
    .option('-d, --description <description>', 'Product description')
    .option('--recurring-interval <interval>', 'Billing interval: WEEK, MONTH, SEMESTER, YEAR')
    .option('--recurring-interval-count <count>', 'Number of intervals per billing cycle', parseInt)
    .option('--is-active', 'Activate the product (sets is_active: true)')
    .option('--no-is-active', 'Deactivate the product (sets is_active: false)')
    .option('--is-price-inclusive-of-vat', 'Price is inclusive of VAT')
    .option('--is-price-exempt-from-vat', 'Price is exempt from VAT')
    .option('--data <json>', 'Pass entire request body as a JSON string (overrides all other flags)')
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format')
    .option('--pretty', 'output in pretty format (default)')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        let data: any;

        if (options.data) {
          data = parseJson(options.data);
        } else {
          data = {};
          let hasField = false;

          if (options.name) {
            data.name = options.name;
            hasField = true;
          }

          if (options.type) {
            data.type = options.type;
            hasField = true;
          }

          if (options.prices) {
            data.prices = parseJson(options.prices);
            hasField = true;
          }

          if (options.price !== undefined) {
            data.price = options.price;
            hasField = true;
          }

          if (options.currency) {
            data.currency = options.currency;
            hasField = true;
          }

          if (options.description) {
            data.description = options.description;
            hasField = true;
          }

          if (options.recurringInterval) {
            data.recurring_interval = options.recurringInterval;
            hasField = true;
          }

          if (options.recurringIntervalCount !== undefined) {
            data.recurring_interval_count = options.recurringIntervalCount;
            hasField = true;
          }

          if (options.isActive !== undefined) {
            data.is_active = options.isActive;
            hasField = true;
          }

          if (options.isPriceInclusiveOfVat) {
            data.is_price_inclusive_of_vat = true;
            hasField = true;
          }

          if (options.isPriceExemptFromVat) {
            data.is_price_exempt_from_vat = true;
            hasField = true;
          }

          if (!hasField) {
            throw new Error(
              'At least one field must be provided to update. ' +
              'Use --data <json> or individual flags such as --name, --type, --is-active, etc.',
            );
          }
        }

        const result = await client.updateProduct(id, data);
        OutputFormatter.success('Product updated successfully');
        if (options.json) {
          OutputFormatter.output(result, { json: true });
        } else if (options.table) {
          OutputFormatter.outputProductTable({ data: [result] });
        } else {
          OutputFormatter.outputProductDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to update product', error);
        process.exit(1);
      }
    });
}
