import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createCheckoutActivateCommand(): Command {
  const command = new Command('activate')
    .description('Activate a payment link')
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

        const result = await client.updatePaymentLinkStatus(id, { status: 'ACTIVE' });
        OutputFormatter.success('Payment link activated successfully');
        if (options.pretty) {
          OutputFormatter.outputCheckoutDetail(result);
        } else {
          OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
        }
      } catch (error) {
        OutputFormatter.error('Failed to activate payment link', error);
        process.exit(1);
      }
    });

  return command;
}
