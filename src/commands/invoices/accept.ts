import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function registerAcceptCommand(invoice: Command): void {
  invoice
    .command('accept')
    .description('Accept an invoice')
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

        const result = await client.acceptInvoice(id);
        OutputFormatter.success('Invoice accepted successfully');
        if (options.pretty) {
          OutputFormatter.outputInvoiceDetail(result);
        } else {
          OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
        }
      } catch (error) {
        OutputFormatter.error('Failed to accept invoice', error);
        process.exit(1);
      }
    });
}
