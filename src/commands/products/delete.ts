import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createProductDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete a product')
    .argument('<id>', 'Product ID')
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

        const result = await client.deleteProduct(id);
        OutputFormatter.success(`Product ${id} deleted successfully`);
        OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
      } catch (error) {
        OutputFormatter.error('Failed to delete product', error);
        process.exit(1);
      }
    });
}
