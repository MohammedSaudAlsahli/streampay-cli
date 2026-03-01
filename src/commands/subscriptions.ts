import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter, parseJson } from '../utils';

export function createSubscriptionCommands(): Command {
  const subscription = new Command('subs')
    .description('Manage subscriptions');

  // Create subscription
  subscription
    .command('create')
    .description('Create a new subscription')
    .requiredOption('--consumer-id <id>', 'Consumer ID')
    .requiredOption('--product-id <id>', 'Product ID')
    .requiredOption('--start-date <date>', 'Start date (ISO 8601 format)')
    .option('--metadata <json>', 'Metadata as JSON string')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const data: any = {
          consumer_id: options.consumerId,
          product_id: options.productId,
          start_date: options.startDate,
        };

        if (options.metadata) {
          data.metadata = parseJson(options.metadata);
        }

        const result = await client.createSubscription(data);
        OutputFormatter.success('Subscription created successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to create subscription', error);
        process.exit(1);
      }
    });

  // Get subscription
  subscription
    .command('get')
    .description('Get a subscription by ID')
    .argument('<id>', 'Subscription ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.getSubscription(id);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to get subscription', error);
        process.exit(1);
      }
    });

  // List subscriptions
  subscription
    .command('list')
    .description('List all subscriptions')
    .option('--limit <number>', 'Number of items per page', parseInt)
    .option('--page <number>', 'Page number', parseInt)
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <direction>', 'Sort direction (asc|desc)')
    .option('--search <query>', 'Search query')
    .option('--format <format>', 'Output format (json|table|pretty)', 'table')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const params: any = {};
        if (options.limit) params.limit = options.limit;
        if (options.page) params.page = options.page;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) params.sort_direction = options.sortDirection;
        if (options.search) params.search_term = options.search;

        const result = await client.listSubscriptions(params);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to list subscriptions', error);
        process.exit(1);
      }
    });

  // Update subscription
  subscription
    .command('update')
    .description('Update a subscription')
    .argument('<id>', 'Subscription ID')
    .option('--product-id <id>', 'Product ID')
    .option('--start-date <date>', 'Start date (ISO 8601 format)')
    .option('--metadata <json>', 'Metadata as JSON string')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const data: any = {};
        if (options.productId) data.product_id = options.productId;
        if (options.startDate) data.start_date = options.startDate;
        if (options.metadata) data.metadata = parseJson(options.metadata);

        if (Object.keys(data).length === 0) {
          throw new Error('At least one field must be provided for update (--product-id, --start-date, or --metadata)');
        }

        const result = await client.updateSubscription(id, data);
        OutputFormatter.success('Subscription updated successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to update subscription', error);
        process.exit(1);
      }
    });

  // Cancel subscription
  subscription
    .command('cancel')
    .description('Cancel a subscription')
    .argument('<id>', 'Subscription ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.cancelSubscription(id);
        OutputFormatter.success('Subscription cancelled successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to cancel subscription', error);
        process.exit(1);
      }
    });

  // Freeze subscription
  subscription
    .command('freeze')
    .description('Freeze a subscription')
    .argument('<id>', 'Subscription ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.freezeSubscription(id, {});
        OutputFormatter.success('Subscription frozen successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to freeze subscription', error);
        process.exit(1);
      }
    });

  // Unfreeze subscription
  subscription
    .command('unfreeze')
    .description('Unfreeze a subscription')
    .argument('<id>', 'Subscription ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.unfreezeSubscription(id);
        OutputFormatter.success('Subscription unfrozen successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to unfreeze subscription', error);
        process.exit(1);
      }
    });

  return subscription;
}
