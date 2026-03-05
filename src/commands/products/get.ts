import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createProductGetCommand(): Command {
  return new Command('get')
    .description('Get a product by ID')
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

        const result = await client.getProduct(id);
        OutputFormatter.success('Product retrieved successfully');
        if (options.json) {
          OutputFormatter.output(result, { json: true });
        } else if (options.table) {
          OutputFormatter.outputProductTable({ data: [result] });
        } else {
          OutputFormatter.outputProductDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to get product', error);
        process.exit(1);
      }
    });
}
