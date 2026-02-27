import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter, parseJson } from '../utils';

export function createConsumersCommands(): Command {
  const consumers = new Command('consumers')
    .description('Manage consumers');

  // Create consumer
  consumers
    .command('create')
    .description('Create a new consumer')
    .requiredOption('--name <name>', 'Consumer name')
    .requiredOption('--email <email>', 'Consumer email address')
    .option('--phone <phone>', 'Consumer phone number')
    .option('--metadata <json>', 'Additional metadata as JSON string')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const data: any = {
          name: options.name,
          email: options.email,
        };

        if (options.phone) {
          data.phone = options.phone;
        }

        if (options.metadata) {
          data.metadata = parseJson(options.metadata);
        }

        const result = await client.createConsumer(data);
        OutputFormatter.success('Consumer created successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to create consumer', error);
        process.exit(1);
      }
    });

  // Get consumer
  consumers
    .command('get')
    .description('Get a consumer by ID')
    .argument('<id>', 'Consumer ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.getConsumer(id);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to get consumer', error);
        process.exit(1);
      }
    });

  // List consumers
  consumers
    .command('list')
    .description('List all consumers')
    .option('--limit <number>', 'Maximum number of results per page', parseInt)
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
          ...config,
        });

        const params: any = {};
        if (options.limit) params.limit = options.limit;
        if (options.page) params.page = options.page;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) params.sort_direction = options.sortDirection;
        if (options.search) params.search_term = options.search;

        const result = await client.getAllConsumers(params);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to list consumers', error);
        process.exit(1);
      }
    });

  // Update consumer
  consumers
    .command('update')
    .description('Update a consumer')
    .argument('<id>', 'Consumer ID')
    .option('--name <name>', 'Consumer name')
    .option('--email <email>', 'Consumer email address')
    .option('--phone <phone>', 'Consumer phone number')
    .option('--metadata <json>', 'Additional metadata as JSON string')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const data: any = {};
        let hasFields = false;

        if (options.name) {
          data.name = options.name;
          hasFields = true;
        }

        if (options.email) {
          data.email = options.email;
          hasFields = true;
        }

        if (options.phone) {
          data.phone = options.phone;
          hasFields = true;
        }

        if (options.metadata) {
          data.metadata = parseJson(options.metadata);
          hasFields = true;
        }

        if (!hasFields) {
          throw new Error('At least one field must be provided (--name, --email, --phone, or --metadata)');
        }

        const result = await client.updateConsumer(id, data);
        OutputFormatter.success('Consumer updated successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to update consumer', error);
        process.exit(1);
      }
    });

  // Delete consumer
  consumers
    .command('delete')
    .description('Delete a consumer')
    .argument('<id>', 'Consumer ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.deleteConsumer(id);
        OutputFormatter.success('Consumer deleted successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to delete consumer', error);
        process.exit(1);
      }
    });

  return consumers;
}
