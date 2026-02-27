import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter, parseJson, parseFilters } from '../utils';

function createClient(): StreamAppClient {
  const config = ConfigManager.getConfig();
  return new StreamAppClient({
    apiKey: ConfigManager.getApiKey(),
    apiSecret: config.apiSecret,
    ...config,
  });
}

export function createPaymentsCommands(): Command {
  const cmd = new Command('payments')
    .description('Manage payments');

  // Get payment
  cmd
    .command('get')
    .description('Get a payment by ID')
    .argument('<id>', 'Payment ID')
    .option('--format <format>', 'Output format (json, table, pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const client = createClient();
        const result = await client.getPayment(id);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to get payment', error);
        process.exit(1);
      }
    });

  // List payments
  cmd
    .command('list')
    .description('List all payments')
    .option('--page <number>', 'Page number (starts at 1)', parseInt)
    .option('--limit <number>', 'Items per page (max 100)', parseInt)
    .option('--sort-field <field>', 'Sort by field (e.g. created_at)')
    .option('--sort-direction <direction>', 'Sort direction (asc or desc)')
    .option('--search <term>', 'Search term')
    .option('--format <format>', 'Output format (json, table, pretty)', 'table')
    .action(async (options) => {
      try {
        const client = createClient();
        const params: any = {};
        if (options.page) params.page = options.page;
        if (options.limit) params.limit = options.limit;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) params.sort_direction = options.sortDirection;
        if (options.search) params.search_term = options.search;
        const result = await client.listPayments(params);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to list payments', error);
        process.exit(1);
      }
    });

  // Mark as paid
  cmd
    .command('mark-paid')
    .description('Mark a payment as paid')
    .argument('<id>', 'Payment ID')
    .requiredOption('--payment-method <method>', 'Payment method (e.g. CASH, MADA, VISA, MASTERCARD, BANK_TRANSFER)')
    .option('--format <format>', 'Output format (json, table, pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const client = createClient();
        const data = {
          payment_method: options.paymentMethod,
        };
        const result = await client.markPaymentAsPaid(id, data);
        OutputFormatter.success('Payment marked as paid successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to mark payment as paid', error);
        process.exit(1);
      }
    });

  // Refund payment
  cmd
    .command('refund')
    .description('Refund a payment')
    .argument('<id>', 'Payment ID')
    .requiredOption('--refund-reason <reason>', 'Refund reason (REQUESTED_BY_CUSTOMER, DUPLICATE, FRAUDULENT, OTHER)')
    .option('--format <format>', 'Output format (json, table, pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const client = createClient();
        const data = {
          refund_reason: options.refundReason,
        };
        const result = await client.refundPayment(id, data);
        OutputFormatter.success('Payment refunded successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to refund payment', error);
        process.exit(1);
      }
    });

  // Auto charge on demand
  cmd
    .command('auto-charge')
    .description('Charge a consumer using their latest tokenized card')
    .argument('<payment-id>', 'Payment ID')
    .option('--format <format>', 'Output format (json, table, pretty)', 'pretty')
    .action(async (paymentId, options) => {
      try {
        const client = createClient();
        const result = await client.autoChargeOnDemand(paymentId);
        OutputFormatter.success('Payment charged successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to charge payment', error);
        process.exit(1);
      }
    });

  return cmd;
}
