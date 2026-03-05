import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createSubscriptionListCommand(): Command {
  const command = new Command('list')
    .description('List subscriptions')
    .option('--limit <n>', 'Number of items per page', parseInt)
    .option('--page <n>', 'Page number', parseInt)
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <direction>', 'Sort direction (asc|desc)')
    .option('--search <term>', 'Search term')
    .option('--statuses <csv>', 'Comma-separated status filter (INACTIVE,ACTIVE,EXPIRED,CANCELED,FROZEN)')
    .option('--latest-invoice-paid', 'Filter by latest invoice being paid')
    .option('--latest-invoice-unpaid', 'Filter by latest invoice being unpaid')
    .option('--from-date <datetime>', 'Filter subscriptions from this date')
    .option('--to-date <datetime>', 'Filter subscriptions to this date')
    .option('--from-price <amount>', 'Filter by minimum price')
    .option('--to-price <amount>', 'Filter by maximum price')
    .option('--consumer-id <uuid>', 'Filter by consumer ID (organization_consumer_id)')
    .option('--product-ids <csv>', 'Comma-separated product UUID filter')
    .option('--currencies <csv>', 'Comma-separated currency codes filter')
    .option('--period-start-from <datetime>', 'Filter by current period start from date')
    .option('--period-start-to <datetime>', 'Filter by current period start to date')
    .option('--period-end-from <datetime>', 'Filter by current period end from date')
    .option('--period-end-to <datetime>', 'Filter by current period end to date')
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format')
    .option('--pretty', 'output in pretty format (default)')
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
        if (options.sortField !== undefined) params.sort_field = options.sortField;
        if (options.sortDirection !== undefined) params.sort_direction = options.sortDirection;
        if (options.search !== undefined) params.search_term = options.search;

        if (options.statuses !== undefined) {
          params.statuses = options.statuses.split(',').map((s: string) => s.trim());
        }

        if (options.latestInvoicePaid) {
          params.latest_invoice_is_paid = true;
        } else if (options.latestInvoiceUnpaid) {
          params.latest_invoice_is_paid = false;
        }

        if (options.fromDate !== undefined) params.from_date = options.fromDate;
        if (options.toDate !== undefined) params.to_date = options.toDate;
        if (options.fromPrice !== undefined) params.from_price = options.fromPrice;
        if (options.toPrice !== undefined) params.to_price = options.toPrice;
        if (options.consumerId !== undefined) params.organization_consumer_id = options.consumerId;

        if (options.productIds !== undefined) {
          params.product_ids = options.productIds.split(',').map((s: string) => s.trim());
        }

        if (options.currencies !== undefined) params.currencies = options.currencies;

        if (options.periodStartFrom !== undefined) params.current_period_start_from_date = options.periodStartFrom;
        if (options.periodStartTo !== undefined) params.current_period_start_to_date = options.periodStartTo;
        if (options.periodEndFrom !== undefined) params.current_period_end_from_date = options.periodEndFrom;
        if (options.periodEndTo !== undefined) params.current_period_end_to_date = options.periodEndTo;

        const result = await client.listSubscriptions(params);
        if (options.json) {
          OutputFormatter.output(result, { json: true });
        } else if (options.pretty) {
          OutputFormatter.outputPretty(result);
        } else {
          OutputFormatter.outputSubscriptionTable(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to list subscriptions', error);
        process.exit(1);
      }
    });

  return command;
}
