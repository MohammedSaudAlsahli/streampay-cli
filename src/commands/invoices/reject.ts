import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function registerRejectCommand(invoice: Command): void {
  invoice
    .command('reject')
    .description('Reject an invoice')
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

        const result = await client.rejectInvoice(id);
        OutputFormatter.success('Invoice rejected successfully');
        if (options.pretty) {
          OutputFormatter.outputInvoiceDetail(result);
        } else {
          OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
        }
      } catch (error) {
        OutputFormatter.error('Failed to reject invoice', error);
        process.exit(1);
      }
    });
}
