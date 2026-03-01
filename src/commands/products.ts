import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter, parseJson } from '../utils';

export function createProductCommands(): Command {
  const products = new Command('products')
    .description('Manage products');

  // ---------------------------------------------------------------------------
  // products create
  // ---------------------------------------------------------------------------
  products
    .command('create')
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
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        let data: any;

        if (options.data) {
          // --data mode: use the raw JSON body directly
          data = parseJson(options.data);
        } else {
          // Validate RECURRING requires --recurring-interval
          if (options.type === 'RECURRING' && !options.recurringInterval) {
            throw new Error(
              'RECURRING products require --recurring-interval (WEEK, MONTH, SEMESTER, or YEAR)',
            );
          }

          data = {
            name: options.name,
            type: options.type,
          };

          // prices[] — preferred multi-currency way
          if (options.prices) {
            data.prices = parseJson(options.prices);
          }

          // Legacy single price/currency
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
        if (options.format === 'json') {
          OutputFormatter.output(result, { format: 'json' });
        } else if (options.format === 'table') {
          OutputFormatter.outputProductTable({ data: [result] });
        } else {
          OutputFormatter.outputProductDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to create product', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // products get
  // ---------------------------------------------------------------------------
  products
    .command('get')
    .description('Get a product by ID')
    .argument('<id>', 'Product ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.getProduct(id);
        OutputFormatter.success('Product retrieved successfully');
        if (options.format === 'json') {
          OutputFormatter.output(result, { format: 'json' });
        } else if (options.format === 'table') {
          OutputFormatter.outputProductTable({ data: [result] });
        } else {
          OutputFormatter.outputProductDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to get product', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // products list
  // ---------------------------------------------------------------------------
  products
    .command('list')
    .description('List all products')
    .option('--limit <number>', 'Number of items per page', parseInt)
    .option('--page <number>', 'Page number', parseInt)
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <direction>', 'Sort direction (asc|desc)')
    .option('--search <term>', 'Search term')
    .option('--active', 'Filter by active products only')
    .option('--inactive', 'Filter by inactive products only')
    .option('--type <type>', 'Filter by product type: RECURRING or ONE_OFF')
    .option('--currency <currency>', 'Filter by currency availability (3-char code, e.g. SAR)')
    .option('--format <format>', 'Output format (json|table|pretty)', 'table')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const params: any = {};
        if (options.limit !== undefined) params.limit = options.limit;
        if (options.page !== undefined) params.page = options.page;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) params.sort_direction = options.sortDirection;
        if (options.search) params.search_term = options.search;
        if (options.active) params.active = true;
        if (options.inactive) params.active = false;
        if (options.type) params.type = options.type;
        if (options.currency) params.currency = options.currency;

        const result = await client.listProducts(params);

        // Provide feedback when no results are returned
        const items = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : null);
        if (items !== null && items.length === 0) {
          OutputFormatter.info('No products found matching the given filters');
          return;
        }

        if (options.format === 'json') {
          OutputFormatter.output(result, { format: 'json' });
        } else if (options.format === 'pretty') {
          OutputFormatter.outputPretty(result);
        } else {
          OutputFormatter.outputProductTable(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to list products', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // products update
  // ---------------------------------------------------------------------------
  products
    .command('update')
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
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        let data: any;

        if (options.data) {
          // --data mode: use the raw JSON body directly
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

          // Commander's --is-active / --no-is-active produce options.isActive = true/false
          // We only send is_active when the user explicitly passed one of the flags.
          // Commander sets isActive to `true` when --is-active is passed and `false` when
          // --no-is-active is passed. Both are explicitly provided, so always include it
          // when either flag was used (i.e. isActive is defined).
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
        if (options.format === 'json') {
          OutputFormatter.output(result, { format: 'json' });
        } else if (options.format === 'table') {
          OutputFormatter.outputProductTable({ data: [result] });
        } else {
          OutputFormatter.outputProductDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to update product', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // products delete
  // ---------------------------------------------------------------------------
  products
    .command('delete')
    .description('Delete a product')
    .argument('<id>', 'Product ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.deleteProduct(id);
        OutputFormatter.success(`Product ${id} deleted successfully`);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to delete product', error);
        process.exit(1);
      }
    });

  return products;
}
