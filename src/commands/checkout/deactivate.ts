import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createCheckoutDeactivateCommand(): Command {
  const command = new Command('deactivate')
    .description('Deactivate a payment link')
    .argument('<id>', 'Payment link ID')
    .option('--deactivate-message <msg>', 'Optional message shown when link is deactivated')
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

        const body: any = { status: 'INACTIVE' };
        if (options.deactivateMessage !== undefined) {
          body.deactivate_message = options.deactivateMessage;
        }

        const result = await client.updatePaymentLinkStatus(id, body);
        OutputFormatter.success('Payment link deactivated successfully');
        if (options.pretty) {
          OutputFormatter.outputCheckoutDetail(result);
        } else {
          OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
        }
      } catch (error) {
        OutputFormatter.error('Failed to deactivate payment link', error);
        process.exit(1);
      }
    });

  return command;
}
