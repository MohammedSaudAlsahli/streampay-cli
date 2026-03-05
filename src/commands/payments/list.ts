import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, getMergedFormatOptions } from '../../utils';

const VALID_PAYMENT_STATUSES = [
  'PENDING', 'PROCESSING', 'FAILED_INITIATION', 'SUCCEEDED', 'FAILED',
  'CANCELED', 'UNDER_REVIEW', 'EXPIRED', 'SETTLED', 'REFUNDED',
];

const VALID_SORT_DIRECTIONS = ['asc', 'desc'];

function createClient(): StreamAppClient {
  const config = ConfigManager.getConfig();
  return new StreamAppClient({
    apiKey: ConfigManager.getApiKey(),
    ...config,
  });
}

export function createPaymentsListCommand(): Command {
  const cmd = new Command('list');

  cmd
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
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format (default)')
    .option('--pretty', 'output in pretty format')
    .action(async function(this: Command, options) {
      try {
        if (options.status && options.status.length > 0) {
          for (const s of options.status) {
            if (!VALID_PAYMENT_STATUSES.includes(s)) {
              OutputFormatter.error(`Invalid status: "${s}". Valid values: ${VALID_PAYMENT_STATUSES.join(', ')}`);
              process.exit(1);
            }
          }
        }

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
        const format = getMergedFormatOptions(options, this);
        if (format.json) {
          OutputFormatter.output(result, { json: true });
        } else if (format.pretty) {
          OutputFormatter.outputPretty(result);
        } else {
          OutputFormatter.outputPaymentTable(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to list payments', error);
        process.exit(1);
      }
    });

  return cmd;
}
