import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter, parseJson } from '../utils';

export function createCheckoutCommands(): Command {
  const checkout = new Command('checkout')
    .description('Manage payment links');

  // Create payment link
  checkout
    .command('create')
    .description('Create a new payment link')
    .requiredOption('--amount <number>', 'Payment amount', parseFloat)
    .requiredOption('--currency <currency>', 'Currency code (e.g., SAR, USD)')
    .option('--description <text>', 'Payment description')
    .option('--redirect-url <url>', 'Redirect URL after payment')
    .option('--metadata <json>', 'Metadata as JSON string')
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
          amount: options.amount,
          currency: options.currency,
        };

        if (options.description) {
          data.description = options.description;
        }
        if (options.redirectUrl) {
          data.redirect_url = options.redirectUrl;
        }
        if (options.metadata) {
          data.metadata = parseJson(options.metadata);
        }

        const result = await client.createPaymentLink(data);
        OutputFormatter.success('Payment link created successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to create payment link', error);
        process.exit(1);
      }
    });

  // Get payment link
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
          baseUrl: config.baseUrl,
          branch: config.branch,
        });

        const result = await client.getPaymentLink(id);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to get payment link', error);
        process.exit(1);
      }
    });

  // List payment links
  checkout
    .command('list')
    .description('List all payment links')
    .option('--limit <number>', 'Items per page', parseInt)
    .option('--page <number>', 'Page number', parseInt)
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <order>', 'Sort direction (asc|desc)')
    .option('--search <query>', 'Search query')
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
        if (options.search) params.search = options.search;

        const result = await client.listPaymentLinks(params);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to list payment links', error);
        process.exit(1);
      }
    });

  // Activate payment link
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
          baseUrl: config.baseUrl,
          branch: config.branch,
        });

        const result = await client.updatePaymentLinkStatus(id, { status: 'active' });
        OutputFormatter.success('Payment link activated successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to activate payment link', error);
        process.exit(1);
      }
    });

  // Deactivate payment link
  checkout
    .command('deactivate')
    .description('Deactivate a payment link')
    .argument('<id>', 'Payment link ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          baseUrl: config.baseUrl,
          branch: config.branch,
        });

        const result = await client.updatePaymentLinkStatus(id, { status: 'inactive' });
        OutputFormatter.success('Payment link deactivated successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to deactivate payment link', error);
        process.exit(1);
      }
    });

  return checkout;
}
