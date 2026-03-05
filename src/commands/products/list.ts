import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, getMergedFormatOptions } from '../../utils';

export function createProductListCommand(): Command {
  return new Command('list')
    .description('List all products')
    .option('--limit <number>', 'Number of items per page', parseInt)
    .option('--page <number>', 'Page number', parseInt)
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <direction>', 'Sort direction (asc|desc)')
    .option('--search <term>', 'Search term')
    .option('--active', 'Filter by active products only')
    .option('--inactive', 'Filter by inactive products only')
    .option('--type <type>', 'Filter by product type: RECURRING or ONE_OFF')
    .option('--currency <currency>', 'Filter by currency availability (3-char code, e.g. SAR)')
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
        if (options.limit !== undefined) params.limit = options.limit;
        if (options.page !== undefined) params.page = options.page;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) params.sort_direction = options.sortDirection;
        if (options.search) params.search_term = options.search;
        if (options.active) params.active = true;
        if (options.inactive) params.active = false;
        if (options.type) params.type = options.type;
        if (options.currency) params.currency = options.currency;

        const result = await client.listProducts(params);

        const items = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : null);
        if (items !== null && items.length === 0) {
          OutputFormatter.info('No products found matching the given filters');
          return;
        }

        const format = getMergedFormatOptions(options, this);
        OutputFormatter.output(result, { json: format.json, table: format.table, pretty: format.pretty });
      } catch (error) {
        OutputFormatter.error('Failed to list products', error);
        process.exit(1);
      }
    });
}
