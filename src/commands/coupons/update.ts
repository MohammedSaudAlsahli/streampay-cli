import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, parseJson } from '../../utils';

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
  if (val.startsWith('+') || val.startsWith('-')) {
    return val;
  }
  const num = parseFloat(val);
  if (num < 0) {
    throw new Error(`Discount value must be >= 0, got: ${val}`);
  }
  return num;
};

export function createCouponUpdateCommand(): Command {
  return new Command('update')
    .description('Update a coupon')
    .argument('<id>', 'Coupon ID')
    .option('--name <name>', 'Coupon name (1–80 characters)')
    .option('--discount-value <value>', 'Discount value >= 0 — number or numeric string (e.g. 10, 10.5, 0.25)', parseDiscountValue)
    .option('--is-percentage <bool>', 'true = percentage discount, false = fixed amount', parseBool)
    .option('--currency <currency>', `Currency code (${VALID_CURRENCIES.join('|')})`)
    .option('--is-active <bool>', 'Whether the coupon is active', parseBool)
    .option('--data <json>', 'Raw JSON body — overrides all other flags')
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
        if (options.json) {
          OutputFormatter.output(result, { json: true });
        } else if (options.table) {
          OutputFormatter.outputCouponTable({ data: [result] });
        } else {
          OutputFormatter.outputCouponDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to update coupon', error);
        process.exit(1);
      }
    });
}
