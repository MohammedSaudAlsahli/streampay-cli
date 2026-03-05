import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, parseJson } from '../../utils';

export function createSubscriptionCancelCommand(): Command {
  const command = new Command('cancel')
    .description('Cancel a subscription')
    .argument('<id>', 'Subscription ID')
    .option('--cancel-invoices', 'Also cancel related invoices (cancel_related_invoices: true)')
    .option('--data <json>', 'Raw request body as JSON (overrides all other flags)')
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

        let body: any;

        if (options.data) {
          body = parseJson(options.data);
        } else {
          body = {};
          if (options.cancelInvoices) {
            body.cancel_related_invoices = true;
          }
        }

        const result = await client.cancelSubscription(id, body);
        OutputFormatter.success(`Subscription ${id} cancelled successfully`);
        if (options.json) {
          OutputFormatter.output(result, { json: true });
        } else if (options.table) {
          OutputFormatter.outputSubscriptionTable({ data: [result] });
        } else {
          OutputFormatter.outputSubscriptionDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to cancel subscription', error);
        process.exit(1);
      }
    });

  return command;
}
