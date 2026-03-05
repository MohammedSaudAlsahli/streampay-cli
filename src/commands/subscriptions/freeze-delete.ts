import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createSubscriptionFreezeDeleteCommand(): Command {
  const command = new Command('freeze-delete')
    .description('Delete (unfreeze) a specific freeze period from a subscription')
    .argument('<subscription-id>', 'Subscription ID')
    .argument('<freeze-id>', 'Freeze period ID')
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format')
    .option('--pretty', 'output in pretty format (default)')
    .action(async (subscriptionId, freezeId, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.deleteSubscriptionFreeze(subscriptionId, freezeId);
        OutputFormatter.success(`Freeze period ${freezeId} deleted from subscription ${subscriptionId}`);
        OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
      } catch (error) {
        OutputFormatter.error('Failed to delete freeze period', error);
        process.exit(1);
      }
    });

  return command;
}
