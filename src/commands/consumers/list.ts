import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, getMergedFormatOptions } from '../../utils';

export function createConsumersListCommand(): Command {
  const command = new Command('list')
    .description('List all consumers')
    .option('--page <number>', 'Page number', parseInt)
    .option('--limit <number>', 'Results per page (max 100)', parseInt)
    .option('--search <term>', 'Search term')
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <direction>', 'Sort direction (asc|desc)')
    .option('--json', 'Output in JSON format')
    .option('--table', 'Output in table format (default)')
    .option('--pretty', 'Output in pretty format')
    .action(async function(this: Command, options) {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({ apiKey: ConfigManager.getApiKey(), ...config });

        const params: Record<string, any> = {};
        if (options.page !== undefined) params.page = options.page;
        if (options.limit !== undefined) params.limit = options.limit;
        if (options.search) params.search_term = options.search;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) params.sort_direction = options.sortDirection;

        const result = await client.getAllConsumers(params);
        const format = getMergedFormatOptions(options, this);
        
        if (format.json) {
          OutputFormatter.output(result, { json: true });
        } else if (format.pretty) {
          OutputFormatter.outputPretty(result);
        } else {
          OutputFormatter.outputConsumerTable(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to list consumers', error);
        process.exit(1);
      }
    });

  return command;
}
