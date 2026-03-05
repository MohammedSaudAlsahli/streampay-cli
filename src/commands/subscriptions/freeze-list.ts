import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createSubscriptionFreezeListCommand(): Command {
  const command = new Command('freeze-list')
    .description('List all freeze periods for a subscription')
    .argument('<subscription-id>', 'Subscription ID')
    .option('--limit <n>', 'Number of items per page', parseInt)
    .option('--page <n>', 'Page number', parseInt)
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <direction>', 'Sort direction (asc|desc)')
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format')
    .option('--pretty', 'output in pretty format (default)')
    .action(async (subscriptionId, options) => {
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

        const result = await client.listSubscriptionFreezes(subscriptionId, params);
        if (options.json) {
          OutputFormatter.output(result, { json: true });
        } else if (options.pretty) {
          OutputFormatter.outputPretty(result);
        } else {
          OutputFormatter.outputFreezeTable(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to list subscription freeze periods', error);
        process.exit(1);
      }
    });

  return command;
}
