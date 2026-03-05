import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, parseJson } from '../../utils';

export function createProductCreateCommand(): Command {
  return new Command('create')
    .description('Create a new product')
    .requiredOption('-n, --name <name>', 'Product name')
    .requiredOption('-t, --type <type>', 'Product type: RECURRING or ONE_OFF')
    .option('--prices <json>', 'Prices array as JSON (e.g. \'[{"currency":"SAR","amount":299}]\') — preferred over --price/--currency')
    .option('-p, --price <price>', 'Legacy single price (deprecated; prefer --prices)', parseFloat)
    .option('-c, --currency <currency>', 'Legacy currency code (deprecated; prefer --prices)')
    .option('-d, --description <description>', 'Product description')
    .option('--recurring-interval <interval>', 'Billing interval for RECURRING products: WEEK, MONTH, SEMESTER, YEAR')
    .option('--recurring-interval-count <count>', 'Number of intervals per billing cycle (default 1)', parseInt)
    .option('--is-one-time', 'Mark product as one-time (boolean flag)')
    .option('--is-price-inclusive-of-vat', 'Price is inclusive of VAT')
    .option('--is-price-exempt-from-vat', 'Price is exempt from VAT')
    .option('--data <json>', 'Pass entire request body as a JSON string (overrides all other flags)')
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

        let data: any;

        if (options.data) {
          data = parseJson(options.data);
        } else {
          if (options.type === 'RECURRING' && !options.recurringInterval) {
            throw new Error(
              'RECURRING products require --recurring-interval (WEEK, MONTH, SEMESTER, or YEAR)',
            );
          }

          data = {
            name: options.name,
            type: options.type,
          };

          if (options.prices) {
            data.prices = parseJson(options.prices);
          }

          if (options.price !== undefined) {
            data.price = options.price;
          }
          if (options.currency) {
            data.currency = options.currency;
          }

          if (options.description) {
            data.description = options.description;
          }

          if (options.recurringInterval) {
            data.recurring_interval = options.recurringInterval;
          }

          if (options.recurringIntervalCount !== undefined) {
            data.recurring_interval_count = options.recurringIntervalCount;
          }

          if (options.isOneTime) {
            data.is_one_time = true;
          }

          if (options.isPriceInclusiveOfVat) {
            data.is_price_inclusive_of_vat = true;
          }

          if (options.isPriceExemptFromVat) {
            data.is_price_exempt_from_vat = true;
          }
        }

        const result = await client.createProduct(data);
        OutputFormatter.success('Product created successfully');
        if (options.json) {
          OutputFormatter.output(result, { json: true });
        } else if (options.table) {
          OutputFormatter.outputProductTable({ data: [result] });
        } else {
          OutputFormatter.outputProductDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to create product', error);
        process.exit(1);
      }
    });
}
