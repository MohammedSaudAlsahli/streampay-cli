import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, parseJson } from '../../utils';

export function createSubscriptionUpdateCommand(): Command {
  const command = new Command('update')
    .description('Update a subscription (items and coupons are full replacements)')
    .argument('<id>', 'Subscription ID')
    .option('--items <json>', 'Full replacement items array, e.g. \'[{"product_id":"uuid","quantity":1,"coupons":[]}]\'')
    .option('--coupons <json>', 'Full replacement coupon UUIDs array, e.g. \'["uuid1"]\'')
    .option('--description <text>', 'Subscription description')
    .option('--until-cycle-number <n>', 'Limit subscription to N billing cycles', parseInt)
    .option('--override-payment-methods <json>', 'Override payment methods as JSON object')
    .option('--data <json>', 'Raw request body as JSON (overrides all other flags)')
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

        let body: any;

        if (options.data) {
          body = parseJson(options.data);
        } else {
          if (!options.items) {
            throw new Error('--items is required for update (full replacement array) — or use --data for raw body');
          }
          if (!options.coupons) {
            throw new Error('--coupons is required for update (full replacement array) — or use --data for raw body');
          }

          body = {
            items: parseJson(options.items),
            coupons: parseJson(options.coupons),
          };

          if (options.description !== undefined) {
            body.description = options.description;
          }
          if (options.untilCycleNumber !== undefined) {
            body.until_cycle_number = options.untilCycleNumber;
          }
          if (options.overridePaymentMethods !== undefined) {
            body.override_payment_methods = parseJson(options.overridePaymentMethods);
          }
        }

        const result = await client.updateSubscription(id, body);
        OutputFormatter.success('Subscription updated successfully');
        if (options.json) {
          OutputFormatter.output(result, { json: true });
        } else if (options.table) {
          OutputFormatter.outputSubscriptionTable({ data: [result] });
        } else {
          OutputFormatter.outputSubscriptionDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to update subscription', error);
        process.exit(1);
      }
    });

  return command;
}
