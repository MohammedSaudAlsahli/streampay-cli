import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

const VALID_STATUSES = ['ACTIVE', 'INACTIVE', 'COMPLETED'];

export function createCheckoutListCommand(): Command {
  const command = new Command('list')
    .description('List payment links')
    .option('--page <n>', 'Page number', parseInt)
    .option('--limit <n>', 'Results per page (max 100)', parseInt)
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <dir>', 'Sort direction (asc|desc)')
    .option('--statuses <statuses>', 'Comma-separated statuses (ACTIVE,INACTIVE,COMPLETED)')
    .option('--from-date <datetime>', 'Filter from date-time')
    .option('--to-date <datetime>', 'Filter to date-time')
    .option('--from-price <n>', 'Filter from price')
    .option('--to-price <n>', 'Filter to price')
    .option('--product-ids <uuids>', 'Comma-separated product UUIDs')
    .option('--currencies <codes>', 'Comma-separated currency codes (e.g. SAR,USD)')
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

        if (options.page !== undefined) params.page = options.page;
        if (options.limit !== undefined) params.limit = options.limit;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) {
          if (!['asc', 'desc'].includes(options.sortDirection)) {
            throw new Error(`Invalid sort direction "${options.sortDirection}". Must be one of: asc, desc`);
          }
          params.sort_direction = options.sortDirection;
        }

        if (options.statuses) {
          const statusList = options.statuses.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean);
          for (const s of statusList) {
            if (!VALID_STATUSES.includes(s)) {
              throw new Error(
                `Invalid status "${s}". Must be one of: ${VALID_STATUSES.join(', ')}`,
              );
            }
          }
          params.statuses = statusList;
        }

        if (options.fromDate) params.from_date = options.fromDate;
        if (options.toDate) params.to_date = options.toDate;
        if (options.fromPrice !== undefined) params.from_price = options.fromPrice;
        if (options.toPrice !== undefined) params.to_price = options.toPrice;

        if (options.productIds) {
          params.product_ids = options.productIds.split(',').map((s: string) => s.trim()).filter(Boolean);
        }

        if (options.currencies) params.currencies = options.currencies;

        const result = await client.listPaymentLinks(params);
        if (options.table) {
          OutputFormatter.outputCheckoutTable(result);
        } else {
          OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
        }
      } catch (error) {
        OutputFormatter.error('Failed to list payment links', error);
        process.exit(1);
      }
    });

  return command;
}
