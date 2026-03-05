import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createSubscriptionGetCommand(): Command {
  const command = new Command('get')
    .description('Get a subscription by ID')
    .argument('<id>', 'Subscription ID')
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format')
    .option('--pretty', 'output in pretty format (default)')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.getSubscription(id);
        OutputFormatter.success('Subscription retrieved successfully');
        if (options.json) {
          OutputFormatter.output(result, { json: true });
        } else if (options.table) {
          OutputFormatter.outputSubscriptionTable({ data: [result] });
        } else {
          OutputFormatter.outputSubscriptionDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to get subscription', error);
        process.exit(1);
      }
    });

  return command;
}
