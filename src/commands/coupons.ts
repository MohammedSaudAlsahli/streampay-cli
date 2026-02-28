import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter, parseJson } from '../utils';

const VALID_CURRENCIES = ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'BHD', 'KWD', 'OMR', 'QAR'];

const parseBool = (val: string): boolean => {
  if (val === 'true' || val === '1') return true;
  if (val === 'false' || val === '0') return false;
  throw new Error(`Invalid boolean value: "${val}". Use true or false.`);
};

const DISCOUNT_VALUE_REGEX = /^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/;

const parseDiscountValue = (val: string): number | string => {
  if (!DISCOUNT_VALUE_REGEX.test(val)) {
    throw new Error(
      `Invalid discount value: "${val}". Must be a number >= 0 (e.g. 10, 10.5, 0.25).`,
    );
  }
  // If it starts with a sign character, keep as string (API accepts string form)
  if (val.startsWith('+') || val.startsWith('-')) {
    return val;
  }
  const num = parseFloat(val);
  if (num < 0) {
    throw new Error(`Discount value must be >= 0, got: ${val}`);
  }
  return num;
};

export function createCouponsCommands(): Command {
  const coupons = new Command('coupons')
    .description('Manage coupons');

  // Create coupon
  coupons
    .command('create')
    .description('Create a new coupon')
    .option('--name <name>', 'Coupon name (1–80 characters)')
    .option('--discount-value <value>', 'Discount value >= 0 — number or numeric string (e.g. 10, 10.5, 0.25)', parseDiscountValue)
    .option('--is-percentage <bool>', 'true = percentage discount, false = fixed amount (default: false)', parseBool)
    .option('--currency <currency>', `Currency code — required for fixed discounts (${VALID_CURRENCIES.join('|')})`)
    .option('--is-active <bool>', 'Whether the coupon is active (default: true)', parseBool)
    .option('--data <json>', 'Raw JSON body — overrides all other flags')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        let data: any;

        if (options.data) {
          data = parseJson(options.data);
        } else {
          if (!options.name) {
            throw new Error('--name is required when --data is not provided');
          }
          if (options.discountValue === undefined) {
            throw new Error('--discount-value is required when --data is not provided');
          }

          const isPercentage: boolean = options.isPercentage ?? false;

          if (isPercentage && options.currency) {
            OutputFormatter.warning('--currency is ignored for percentage coupons and will not be sent');
          }

          if (!isPercentage && !options.currency) {
            OutputFormatter.warning('--currency is recommended for fixed-amount coupons');
          }

          data = {
            name: options.name,
            discount_value: options.discountValue,
            is_percentage: isPercentage,
          };

          if (!isPercentage && options.currency) {
            data.currency = options.currency;
          }

          if (options.isActive !== undefined) {
            data.is_active = options.isActive;
          }
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
        OutputFormatter.success('Coupon retrieved successfully');
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
    .option('--page <number>', 'Page number (min 1)', parseInt)
    .option('--limit <number>', 'Items per page (min 1, max 100)', parseInt)
    .option('--search <term>', 'Search by coupon name')
    .option('--active <bool>', 'Filter by active status (true|false)', parseBool)
    .option('--is-percentage <bool>', 'Filter by discount type (true|false)', parseBool)
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <direction>', 'Sort direction (asc|desc)')
    .option('--format <format>', 'Output format (json|table|pretty)', 'table')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const params: Record<string, any> = {};
        if (options.page !== undefined) params.page = options.page;
        if (options.limit !== undefined) params.limit = options.limit;
        if (options.search) params.search_term = options.search;
        if (options.active !== undefined) params.active = options.active;
        if (options.isPercentage !== undefined) params.is_percentage = options.isPercentage;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) params.sort_direction = options.sortDirection;

        OutputFormatter.info('Listing coupons...');
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
    .option('--name <name>', 'Coupon name (1–80 characters)')
    .option('--discount-value <value>', 'Discount value >= 0 — number or numeric string (e.g. 10, 10.5, 0.25)', parseDiscountValue)
    .option('--is-percentage <bool>', 'true = percentage discount, false = fixed amount', parseBool)
    .option('--currency <currency>', `Currency code (${VALID_CURRENCIES.join('|')})`)
    .option('--is-active <bool>', 'Whether the coupon is active', parseBool)
    .option('--data <json>', 'Raw JSON body — overrides all other flags')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        let data: any;

        if (options.data) {
          data = parseJson(options.data);
        } else {
          data = {};
          let hasUpdates = false;

          if (options.name !== undefined) {
            data.name = options.name;
            hasUpdates = true;
          }
          if (options.discountValue !== undefined) {
            data.discount_value = options.discountValue;
            hasUpdates = true;
          }
          if (options.isPercentage !== undefined) {
            data.is_percentage = options.isPercentage;
            hasUpdates = true;
          }
          if (options.currency !== undefined) {
            data.currency = options.currency;
            hasUpdates = true;
          }
          if (options.isActive !== undefined) {
            data.is_active = options.isActive;
            hasUpdates = true;
          }

          if (!hasUpdates) {
            throw new Error('At least one field must be provided to update');
          }
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

  return coupons;
}
