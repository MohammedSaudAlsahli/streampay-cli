import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createCheckoutGetCommand(): Command {
  const command = new Command('get')
    .description('Get a payment link by ID')
    .argument('<id>', 'Payment link ID')
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

        const result = await client.getPaymentLink(id);
        OutputFormatter.success('Payment link retrieved successfully');
        if (options.pretty) {
          OutputFormatter.outputCheckoutDetail(result);
        } else {
          OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
        }
      } catch (error) {
        OutputFormatter.error('Failed to get payment link', error);
        process.exit(1);
      }
    });

  return command;
}
