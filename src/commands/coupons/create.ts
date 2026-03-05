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

export function createCouponCreateCommand(): Command {
  return new Command('create')
    .description('Create a new coupon')
    .option('--name <name>', 'Coupon name (1–80 characters)')
    .option('--discount-value <value>', 'Discount value >= 0 — number or numeric string (e.g. 10, 10.5, 0.25)', parseDiscountValue)
    .option('--is-percentage <bool>', 'true = percentage discount, false = fixed amount (default: false)', parseBool)
    .option('--currency <currency>', `Currency code — required for fixed discounts (${VALID_CURRENCIES.join('|')})`)
    .option('--is-active <bool>', 'Whether the coupon is active (default: true)', parseBool)
    .option('--data <json>', 'Raw JSON body — overrides all other flags')
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format')
    .option('--pretty', 'output in pretty format (default)')
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
        if (options.json) {
          OutputFormatter.output(result, { json: true });
        } else if (options.table) {
          OutputFormatter.outputCouponTable({ data: [result] });
        } else {
          OutputFormatter.outputCouponDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to create coupon', error);
        process.exit(1);
      }
    });
}
