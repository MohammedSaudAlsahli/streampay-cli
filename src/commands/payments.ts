import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter } from '../utils';

const VALID_PAYMENT_STATUSES = [
  'PENDING', 'PROCESSING', 'FAILED_INITIATION', 'SUCCEEDED', 'FAILED',
  'CANCELED', 'UNDER_REVIEW', 'EXPIRED', 'SETTLED', 'REFUNDED',
];

const VALID_MANUAL_PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'CARD', 'QURRAH'];

const VALID_REFUND_REASONS = ['REQUESTED_BY_CUSTOMER', 'DUPLICATE', 'FRAUDULENT', 'OTHER'];

const VALID_SORT_DIRECTIONS = ['asc', 'desc'];

function createClient(): StreamAppClient {
  const config = ConfigManager.getConfig();
  return new StreamAppClient({
    apiKey: ConfigManager.getApiKey(),
    ...config,
  });
}

export function createPaymentsCommands(): Command {
  const cmd = new Command('payments')
    .description('Manage payments');

  // ── Get payment ──────────────────────────────────────────────────────────
  cmd
    .command('get')
    .description('Get a payment by ID')
    .argument('<id>', 'Payment ID (UUID)')
    .option('--format <format>', 'Output format: json, table, pretty', 'pretty')
    .action(async (id, options) => {
      try {
        const client = createClient();
        const result = await client.getPayment(id);
        OutputFormatter.outputPaymentDetail(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to get payment', error);
        process.exit(1);
      }
    });

  // ── List payments ────────────────────────────────────────────────────────
  cmd
    .command('list')
    .description('List payments with optional filters')
    .option('--invoice-id <uuid>', 'Filter by invoice ID (repeatable)',
      (val: string, prev: string[]) => [...(prev || []), val], [] as string[])
    .option('--status <status>', `Filter by status (repeatable). Valid: ${VALID_PAYMENT_STATUSES.join(', ')}`,
      (val: string, prev: string[]) => [...(prev || []), val.toUpperCase()], [] as string[])
    .option('--search <term>', 'Search term')
    .option('--from-date <datetime>', 'Filter from date (ISO 8601, e.g. 2024-01-01T00:00:00)')
    .option('--to-date <datetime>', 'Filter to date (ISO 8601, e.g. 2024-12-31T23:59:59)')
    .option('--page <number>', 'Page number (starts at 1)', parseInt)
    .option('--limit <number>', 'Items per page, max 100', parseInt)
    .option('--sort-field <field>', 'Sort by field (e.g. amount, scheduled_on)')
    .option('--sort-direction <direction>', 'Sort direction: asc or desc')
    .option('--format <format>', 'Output format: json, table, pretty', 'table')
    .action(async (options) => {
      try {
        // Validate statuses
        if (options.status && options.status.length > 0) {
          for (const s of options.status) {
            if (!VALID_PAYMENT_STATUSES.includes(s)) {
              OutputFormatter.error(`Invalid status: "${s}". Valid values: ${VALID_PAYMENT_STATUSES.join(', ')}`);
              process.exit(1);
            }
          }
        }

        // Validate sort direction
        if (options.sortDirection && !VALID_SORT_DIRECTIONS.includes(options.sortDirection.toLowerCase())) {
          OutputFormatter.error(`Invalid sort direction: "${options.sortDirection}". Valid values: asc, desc`);
          process.exit(1);
        }

        const client = createClient();
        const params: any = {};
        if (options.invoiceId && options.invoiceId.length > 0) params.invoice_id = options.invoiceId;
        if (options.status && options.status.length > 0) params.statuses = options.status;
        if (options.search) params.search_term = options.search;
        if (options.fromDate) params.from_date = options.fromDate;
        if (options.toDate) params.to_date = options.toDate;
        if (options.page) params.page = options.page;
        if (options.limit) params.limit = options.limit;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) params.sort_direction = options.sortDirection.toLowerCase();

        const result = await client.listPayments(params);
        OutputFormatter.outputPaymentTable(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to list payments', error);
        process.exit(1);
      }
    });

  // ── Mark as paid ─────────────────────────────────────────────────────────
  cmd
    .command('mark-paid')
    .description('Manually mark a payment as paid (manual methods only)')
    .argument('<id>', 'Payment ID (UUID)')
    .requiredOption(
      '--payment-method <method>',
      `Manual payment method. Valid: ${VALID_MANUAL_PAYMENT_METHODS.join(', ')}`,
    )
    .option('--note <note>', 'Note or reference number (e.g. transaction ID, receipt number)')
    .option('--format <format>', 'Output format: json, table, pretty', 'pretty')
    .action(async (id, options) => {
      try {
        const method = options.paymentMethod.toUpperCase();
        if (!VALID_MANUAL_PAYMENT_METHODS.includes(method)) {
          OutputFormatter.error(
            `Invalid payment method: "${options.paymentMethod}". ` +
            `Only manual methods are allowed: ${VALID_MANUAL_PAYMENT_METHODS.join(', ')}`
          );
          process.exit(1);
        }

        const client = createClient();
        const data: any = { payment_method: method };
        if (options.note) data.note = options.note;

        await client.markPaymentAsPaid(id, data);
        OutputFormatter.success('Payment marked as paid successfully');
      } catch (error) {
        OutputFormatter.error('Failed to mark payment as paid', error);
        process.exit(1);
      }
    });

  // ── Refund payment ───────────────────────────────────────────────────────
  cmd
    .command('refund')
    .description('Refund a payment')
    .argument('<id>', 'Payment ID (UUID)')
    .requiredOption(
      '--refund-reason <reason>',
      `Reason for the refund. Valid: ${VALID_REFUND_REASONS.join(', ')}`,
    )
    .option('--refund-note <note>', 'Optional note explaining the refund')
    .option(
      '--allow-multiple',
      'If the payment is part of a multi-payment transaction, refund all related payments',
    )
    .option('--format <format>', 'Output format: json, table, pretty', 'pretty')
    .action(async (id, options) => {
      try {
        const reason = options.refundReason.toUpperCase();
        if (!VALID_REFUND_REASONS.includes(reason)) {
          OutputFormatter.error(
            `Invalid refund reason: "${options.refundReason}". Valid values: ${VALID_REFUND_REASONS.join(', ')}`
          );
          process.exit(1);
        }

        const client = createClient();
        const data: any = { refund_reason: reason };
        if (options.refundNote) data.refund_note = options.refundNote;
        if (options.allowMultiple) data.allow_refund_multiple_related_payments = true;

        const result = await client.refundPayment(id, data);
        OutputFormatter.success('Payment refunded successfully');
        OutputFormatter.outputPaymentDetail(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to refund payment', error);
        process.exit(1);
      }
    });

  // ── Auto charge on demand ────────────────────────────────────────────────
  cmd
    .command('auto-charge')
    .description('Charge a payment using the consumer\'s latest tokenized card (restricted API)')
    .argument('<payment-id>', 'Payment ID (UUID)')
    .option('--format <format>', 'Output format: json, table, pretty', 'pretty')
    .action(async (paymentId, options) => {
      try {
        const client = createClient();
        const result = await client.autoChargeOnDemand(paymentId);
        OutputFormatter.success('Payment charged successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to auto-charge payment', error);
        process.exit(1);
      }
    });

  return cmd;
}
