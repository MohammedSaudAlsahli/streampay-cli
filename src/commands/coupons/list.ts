import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

const parseBool = (val: string): boolean => {
  if (val === 'true' || val === '1') return true;
  if (val === 'false' || val === '0') return false;
  throw new Error(`Invalid boolean value: "${val}". Use true or false.`);
};

export function createCouponListCommand(): Command {
  return new Command('list')
    .description('List all coupons')
    .option('--page <number>', 'Page number (min 1)', parseInt)
    .option('--limit <number>', 'Items per page (min 1, max 100)', parseInt)
    .option('--search <term>', 'Search by coupon name')
    .option('--active <bool>', 'Filter by active status (true|false)', parseBool)
    .option('--is-percentage <bool>', 'Filter by discount type (true|false)', parseBool)
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <direction>', 'Sort direction (asc|desc)')
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

        const params: Record<string, any> = {};
        if (options.page !== undefined) params.page = options.page;
        if (options.limit !== undefined) params.limit = options.limit;
        if (options.search) params.search_term = options.search;
        if (options.active !== undefined) params.active = options.active;
        if (options.isPercentage !== undefined) params.is_percentage = options.isPercentage;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) params.sort_direction = options.sortDirection;

        const result = await client.listCoupons(params);
        if (options.json) {
          OutputFormatter.output(result, { json: true });
        } else if (options.pretty) {
          OutputFormatter.outputPretty(result);
        } else {
          OutputFormatter.outputCouponTable(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to list coupons', error);
        process.exit(1);
      }
    });
}
