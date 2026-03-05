import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function registerUpdateCommand(invoice: Command): void {
  invoice
    .command('update')
    .description('Update an invoice in-place (only scheduled_on and description can be changed)')
    .argument('<id>', 'Invoice UUID')
    .option('--scheduled-on <datetime>', 'New payment due date (ISO 8601, must be a future date)')
    .option('--description <text>', 'Updated description/notes (max 500 chars)')
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

        const data: any = {};
        if (options.scheduledOn) data.scheduled_on = options.scheduledOn;
        if (options.description) data.description = options.description;

        if (Object.keys(data).length === 0) {
          throw new Error('At least one field must be provided to update (--scheduled-on or --description)');
        }

        const result = await client.updateInvoiceInPlace(id, data);
        OutputFormatter.success('Invoice updated successfully');
        if (options.pretty) {
          OutputFormatter.outputInvoiceDetail(result);
        } else {
          OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
        }
      } catch (error) {
        OutputFormatter.error('Failed to update invoice', error);
        process.exit(1);
      }
    });
}
