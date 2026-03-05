import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createCouponGetCommand(): Command {
  return new Command('get')
    .description('Get a coupon by ID')
    .argument('<id>', 'Coupon ID')
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

        const result = await client.getCoupon(id);
        OutputFormatter.success('Coupon retrieved successfully');
        if (options.json) {
          OutputFormatter.output(result, { json: true });
        } else if (options.table) {
          OutputFormatter.outputCouponTable({ data: [result] });
        } else {
          OutputFormatter.outputCouponDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to get coupon', error);
        process.exit(1);
      }
    });
}
