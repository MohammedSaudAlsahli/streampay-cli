import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function registerCancelCommand(invoice: Command): void {
  invoice
    .command('cancel')
    .description('Cancel an invoice')
    .argument('<id>', 'Invoice UUID')
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

        const result = await client.cancelInvoice(id);
        OutputFormatter.success('Invoice cancelled successfully');
        if (options.pretty) {
          OutputFormatter.outputInvoiceDetail(result);
        } else {
          OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
        }
      } catch (error) {
        OutputFormatter.error('Failed to cancel invoice', error);
        process.exit(1);
      }
    });
}
