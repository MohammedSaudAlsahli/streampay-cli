import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter, parseJson } from '../utils';

export function createProductCommands(): Command {
  const products = new Command('products')
    .description('Manage products');

  // Create product
  products
    .command('create')
    .description('Create a new product')
    .requiredOption('-n, --name <name>', 'Product name')
    .requiredOption('-p, --price <price>', 'Product price', parseFloat)
    .requiredOption('-c, --currency <currency>', 'Product currency')
    .option('-d, --description <description>', 'Product description')
    .option('-m, --metadata <json>', 'Product metadata as JSON string')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          baseUrl: config.baseUrl,
          branch: config.branch,
        });

        const data: any = {
          name: options.name,
          price: options.price,
          currency: options.currency,
        };

        if (options.description) {
          data.description = options.description;
        }

        if (options.metadata) {
          data.metadata = parseJson(options.metadata);
        }

        const result = await client.createProduct(data);
        OutputFormatter.success('Product created successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to create product', error);
        process.exit(1);
      }
    });

  // Get product
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
          baseUrl: config.baseUrl,
          branch: config.branch,
        });

        const result = await client.getProduct(id);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to get product', error);
        process.exit(1);
      }
    });

  // List products
  products
    .command('list')
    .description('List all products')
    .option('--limit <number>', 'Number of items per page', parseInt)
    .option('--page <number>', 'Page number', parseInt)
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <direction>', 'Sort direction (asc|desc)')
    .option('--search <term>', 'Search term')
    .option('--format <format>', 'Output format (json|table|pretty)', 'table')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          baseUrl: config.baseUrl,
          branch: config.branch,
        });

        const params: any = {};
        if (options.limit) params.limit = options.limit;
        if (options.page) params.page = options.page;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) params.sort_direction = options.sortDirection;
        if (options.search) params.search_term = options.search;

        const result = await client.listProducts(params);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to list products', error);
        process.exit(1);
      }
    });

  // Update product
  products
    .command('update')
    .description('Update a product')
    .argument('<id>', 'Product ID')
    .option('-n, --name <name>', 'Product name')
    .option('-p, --price <price>', 'Product price', parseFloat)
    .option('-c, --currency <currency>', 'Product currency')
    .option('-d, --description <description>', 'Product description')
    .option('-m, --metadata <json>', 'Product metadata as JSON string')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          baseUrl: config.baseUrl,
          branch: config.branch,
        });

        const data: any = {};
        let hasField = false;

        if (options.name) {
          data.name = options.name;
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

        if (options.metadata) {
          data.metadata = parseJson(options.metadata);
          hasField = true;
        }

        if (!hasField) {
          throw new Error('At least one field must be provided to update');
        }

        const result = await client.updateProduct(id, data);
        OutputFormatter.success('Product updated successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to update product', error);
        process.exit(1);
      }
    });

  // Delete product
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
          baseUrl: config.baseUrl,
          branch: config.branch,
        });

        const result = await client.deleteProduct(id);
        OutputFormatter.success('Product deleted successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to delete product', error);
        process.exit(1);
      }
    });

  return products;
}
