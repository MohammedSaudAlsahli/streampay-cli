import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter, parseJson } from '../utils';

export function createInvoiceCommands(): Command {
  const invoice = new Command('invoices')
    .description('Manage invoices');

  // Create invoice
  invoice
    .command('create')
    .description('Create a new invoice')
    .requiredOption('--consumer-id <id>', 'Consumer ID')
    .requiredOption('--amount <amount>', 'Invoice amount')
    .requiredOption('--currency <currency>', 'Currency code (e.g., USD, EUR)')
    .option('--description <description>', 'Invoice description')
    .option('--due-date <date>', 'Due date (ISO 8601 format)')
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
          amount: options.amount,
          currency: options.currency,
        };

        if (options.description) {
          data.description = options.description;
        }
        if (options.dueDate) {
          data.due_date = options.dueDate;
        }
        if (options.metadata) {
          data.metadata = parseJson(options.metadata);
        }

        const result = await client.createInvoice(data);
        OutputFormatter.success('Invoice created successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to create invoice', error);
        process.exit(1);
      }
    });

  // Get invoice
  invoice
    .command('get')
    .description('Get an invoice by ID')
    .argument('<id>', 'Invoice ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.getInvoice(id);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to get invoice', error);
        process.exit(1);
      }
    });

  // List invoices
  invoice
    .command('list')
    .description('List all invoices')
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
        if (options.search) params.search = options.search;

        const result = await client.listInvoices(params);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to list invoices', error);
        process.exit(1);
      }
    });

  // Update invoice
  invoice
    .command('update')
    .description('Update an invoice')
    .argument('<id>', 'Invoice ID')
    .option('--amount <amount>', 'Invoice amount')
    .option('--currency <currency>', 'Currency code')
    .option('--description <description>', 'Invoice description')
    .option('--due-date <date>', 'Due date (ISO 8601 format)')
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
        if (options.amount) data.amount = options.amount;
        if (options.currency) data.currency = options.currency;
        if (options.description) data.description = options.description;
        if (options.dueDate) data.due_date = options.dueDate;
        if (options.metadata) data.metadata = parseJson(options.metadata);

        if (Object.keys(data).length === 0) {
          throw new Error('At least one field must be provided to update');
        }

        const result = await client.updateInvoiceInPlace(id, data);
        OutputFormatter.success('Invoice updated successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to update invoice', error);
        process.exit(1);
      }
    });

  // Send invoice
  invoice
    .command('send')
    .description('Send an invoice to the consumer')
    .argument('<id>', 'Invoice ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.sendInvoice(id);
        OutputFormatter.success('Invoice sent successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to send invoice', error);
        process.exit(1);
      }
    });

  // Accept invoice
  invoice
    .command('accept')
    .description('Accept an invoice')
    .argument('<id>', 'Invoice ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.acceptInvoice(id);
        OutputFormatter.success('Invoice accepted successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to accept invoice', error);
        process.exit(1);
      }
    });

  // Reject invoice
  invoice
    .command('reject')
    .description('Reject an invoice')
    .argument('<id>', 'Invoice ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.rejectInvoice(id);
        OutputFormatter.success('Invoice rejected successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to reject invoice', error);
        process.exit(1);
      }
    });

  // Complete invoice
  invoice
    .command('complete')
    .description('Mark an invoice as completed')
    .argument('<id>', 'Invoice ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.completeInvoice(id);
        OutputFormatter.success('Invoice completed successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to complete invoice', error);
        process.exit(1);
      }
    });

  // Cancel invoice
  invoice
    .command('cancel')
    .description('Cancel an invoice')
    .argument('<id>', 'Invoice ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.cancelInvoice(id);
        OutputFormatter.success('Invoice cancelled successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to cancel invoice', error);
        process.exit(1);
      }
    });

  return invoice;
}
