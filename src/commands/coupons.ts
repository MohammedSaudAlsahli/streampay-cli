import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter, parseJson } from '../utils';

export function createCouponsCommands(): Command {
  const coupons = new Command('coupons')
    .description('Manage coupons');

  // Create coupon
  coupons
    .command('create')
    .description('Create a new coupon')
    .requiredOption('--code <code>', 'Coupon code')
    .requiredOption('--discount-type <type>', 'Discount type (percentage|fixed)')
    .requiredOption('--discount-value <value>', 'Discount value', parseFloat)
    .option('--max-uses <number>', 'Maximum number of uses', parseInt)
    .option('--expires-at <datetime>', 'Expiration date/time (ISO 8601)')
    .option('--metadata <json>', 'Metadata as JSON string')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const data: any = {
          code: options.code,
          discount_type: options.discountType,
          discount_value: options.discountValue,
        };

        if (options.maxUses !== undefined) {
          data.max_uses = options.maxUses;
        }
        if (options.expiresAt) {
          data.expires_at = options.expiresAt;
        }
        if (options.metadata) {
          data.metadata = parseJson(options.metadata);
        }

        const result = await client.createCoupon(data);
        OutputFormatter.success('Coupon created successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to create coupon', error);
        process.exit(1);
      }
    });

  // Get coupon
  coupons
    .command('get')
    .description('Get a coupon by ID')
    .argument('<id>', 'Coupon ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.getCoupon(id);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to get coupon', error);
        process.exit(1);
      }
    });

  // List coupons
  coupons
    .command('list')
    .description('List all coupons')
    .option('--limit <number>', 'Number of items per page', parseInt)
    .option('--page <number>', 'Page number', parseInt)
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <direction>', 'Sort direction (asc|desc)')
    .option('--search <query>', 'Search query')
    .option('--format <format>', 'Output format (json|table|pretty)', 'table')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const params: any = {};
        if (options.limit) params.limit = options.limit;
        if (options.page) params.page = options.page;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) params.sort_direction = options.sortDirection;
        if (options.search) params.search = options.search;

        const result = await client.listCoupons(params);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to list coupons', error);
        process.exit(1);
      }
    });

  // Update coupon
  coupons
    .command('update')
    .description('Update a coupon')
    .argument('<id>', 'Coupon ID')
    .option('--code <code>', 'Coupon code')
    .option('--discount-type <type>', 'Discount type (percentage|fixed)')
    .option('--discount-value <value>', 'Discount value', parseFloat)
    .option('--max-uses <number>', 'Maximum number of uses', parseInt)
    .option('--expires-at <datetime>', 'Expiration date/time (ISO 8601)')
    .option('--metadata <json>', 'Metadata as JSON string')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const data: any = {};
        let hasUpdates = false;

        if (options.code !== undefined) {
          data.code = options.code;
          hasUpdates = true;
        }
        if (options.discountType !== undefined) {
          data.discount_type = options.discountType;
          hasUpdates = true;
        }
        if (options.discountValue !== undefined) {
          data.discount_value = options.discountValue;
          hasUpdates = true;
        }
        if (options.maxUses !== undefined) {
          data.max_uses = options.maxUses;
          hasUpdates = true;
        }
        if (options.expiresAt !== undefined) {
          data.expires_at = options.expiresAt;
          hasUpdates = true;
        }
        if (options.metadata !== undefined) {
          data.metadata = parseJson(options.metadata);
          hasUpdates = true;
        }

        if (!hasUpdates) {
          throw new Error('At least one field must be provided to update');
        }

        const result = await client.updateCoupon(id, data);
        OutputFormatter.success('Coupon updated successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to update coupon', error);
        process.exit(1);
      }
    });

  // Delete coupon
  coupons
    .command('delete')
    .description('Delete a coupon')
    .argument('<id>', 'Coupon ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.deleteCoupon(id);
        OutputFormatter.success('Coupon deleted successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to delete coupon', error);
        process.exit(1);
      }
    });

  return coupons;
}
