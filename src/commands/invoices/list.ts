import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, getMergedFormatOptions } from '../../utils';

const VALID_INVOICE_STATUSES = ['DRAFT', 'CREATED', 'SENT', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELED', 'EXPIRED'];
const VALID_PAYMENT_STATUSES = ['PENDING', 'PROCESSING', 'FAILED_INITIATION', 'SUCCEEDED', 'FAILED', 'CANCELED', 'UNDER_REVIEW', 'EXPIRED', 'SETTLED', 'REFUNDED'];
const VALID_SORT_DIRECTIONS = ['asc', 'desc'];

export function registerListCommand(invoice: Command): void {
  invoice
    .command('list')
    .description('List invoices with filtering and pagination')
    .option('--page <number>', 'Page number (default: 1)', parseInt)
    .option('--limit <number>', 'Items per page, max 100 (default: 10)', parseInt)
    .option('--sort-field <field>', 'Field to sort by (e.g. amount, scheduled_on)')
    .option('--sort-direction <direction>', 'Sort direction: asc|desc')
    .option('--search-term <query>', 'Free-text search across invoices')
    .option('--include-payments', 'Include payment objects in each invoice')
    .option('--payment-link-id <uuid>', 'Filter by payment link UUID')
    .option('--statuses <statuses>', 'Filter by invoice statuses, comma-separated (DRAFT|CREATED|SENT|ACCEPTED|REJECTED|COMPLETED|CANCELED|EXPIRED)')
    .option('--payment-statuses <statuses>', 'Filter by payment statuses, comma-separated (PENDING|PROCESSING|FAILED_INITIATION|SUCCEEDED|FAILED|CANCELED|UNDER_REVIEW|EXPIRED|SETTLED|REFUNDED)')
    .option('--from-date <datetime>', 'Filter invoices created on or after this date (ISO 8601)')
    .option('--to-date <datetime>', 'Filter invoices created on or before this date (ISO 8601)')
    .option('--due-date-from <datetime>', 'Filter invoices with due date on or after this date (ISO 8601)')
    .option('--due-date-to <datetime>', 'Filter invoices with due date on or before this date (ISO 8601)')
    .option('--from-price <amount>', 'Filter invoices with total amount >= this value', parseFloat)
    .option('--to-price <amount>', 'Filter invoices with total amount <= this value', parseFloat)
    .option('--consumer-id <uuid>', 'Filter by consumer UUID (organization_consumer_id)')
    .option('--subscription-id <uuid>', 'Filter by subscription UUID')
    .option('--currencies <codes>', 'Filter by currency codes, comma-separated (e.g. SAR,USD)')
    .option('--payments-not-settled', 'Only return invoices with unsettled SUCCEEDED card/wallet payments')
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format')
    .option('--pretty', 'output in pretty format (default)')
    .action(async function(this: Command, options) {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const params: any = {};
        if (options.page) params.page = options.page;
        if (options.limit) params.limit = options.limit;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) {
          if (!VALID_SORT_DIRECTIONS.includes(options.sortDirection)) {
            throw new Error(`Invalid sort direction "${options.sortDirection}". Must be one of: ${VALID_SORT_DIRECTIONS.join(', ')}`);
          }
          params.sort_direction = options.sortDirection;
        }
        if (options.searchTerm) params.search_term = options.searchTerm;
        if (options.includePayments) params.include_payments = true;
        if (options.paymentLinkId) params.payment_link_id = options.paymentLinkId;
        if (options.statuses) {
          const statusList = options.statuses.split(',').map((s: string) => s.trim().toUpperCase());
          for (const s of statusList) {
            if (!VALID_INVOICE_STATUSES.includes(s)) {
              throw new Error(`Invalid invoice status "${s}". Must be one of: ${VALID_INVOICE_STATUSES.join(', ')}`);
            }
          }
          params.statuses = statusList;
        }
        if (options.paymentStatuses) {
          const payStatusList = options.paymentStatuses.split(',').map((s: string) => s.trim().toUpperCase());
          for (const s of payStatusList) {
            if (!VALID_PAYMENT_STATUSES.includes(s)) {
              throw new Error(`Invalid payment status "${s}". Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}`);
            }
          }
          params.payment_statuses = payStatusList;
        }
        if (options.fromDate) params.from_date = options.fromDate;
        if (options.toDate) params.to_date = options.toDate;
        if (options.dueDateFrom) params.due_date_from = options.dueDateFrom;
        if (options.dueDateTo) params.due_date_to = options.dueDateTo;
        if (options.fromPrice !== undefined) params.from_price = options.fromPrice;
        if (options.toPrice !== undefined) params.to_price = options.toPrice;
        if (options.consumerId) params.organization_consumer_id = options.consumerId;
        if (options.subscriptionId) params.subscription_id = options.subscriptionId;
        if (options.currencies) params.currencies = options.currencies;
        if (options.paymentsNotSettled) params.payments_not_settled = true;

        const result = await client.listInvoices(params);
        const format = getMergedFormatOptions(options, this);
        OutputFormatter.output(result, { json: format.json, table: format.table, pretty: format.pretty });
      } catch (error) {
        OutputFormatter.error('Failed to list invoices', error);
        process.exit(1);
      }
    });
}
