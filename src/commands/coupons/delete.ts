import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createCouponDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete a coupon')
    .argument('<id>', 'Coupon ID')
    .action(async (id) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        await client.deleteCoupon(id);
        OutputFormatter.success('Coupon deleted successfully');
      } catch (error) {
        OutputFormatter.error('Failed to delete coupon', error);
        process.exit(1);
      }
    });
}
