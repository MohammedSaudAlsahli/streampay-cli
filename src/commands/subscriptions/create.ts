import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, parseJson } from '../../utils';

export function createSubscriptionCreateCommand(): Command {
  const command = new Command('create')
    .description('Create a new subscription')
    .option('--consumer-id <uuid>', 'Consumer ID (organization_consumer_id)')
    .option('--period-start <datetime>', 'Period start datetime (ISO 8601)')
    .option('--items <json>', 'Subscription items as JSON array, e.g. \'[{"product_id":"uuid","quantity":1}]\'')
    .option('--notify-consumer', 'Notify the consumer (default: true)')
    .option('--no-notify-consumer', 'Do not notify the consumer')
    .option('--description <text>', 'Subscription description')
    .option('--coupons <json>', 'Coupon UUIDs as JSON array, e.g. \'["uuid1","uuid2"]\'')
    .option('--until-cycle-number <n>', 'Limit subscription to N billing cycles', parseInt)
    .option('--currency <code>', 'Currency code (SAR, USD, EUR, GBP, AED, BHD, KWD, OMR, QAR)')
    .option('--exclude-coupons-if-installments', 'Exclude coupons when installments are in use')
    .option('--override-payment-methods <json>', 'Override payment methods as JSON object')
    .option('--data <json>', 'Raw request body as JSON (overrides all other flags)')
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

        let body: any;

        if (options.data) {
          body = parseJson(options.data);
        } else {
          if (!options.consumerId) {
            throw new Error('--consumer-id is required (or use --data for raw body)');
          }
          if (!options.periodStart) {
            throw new Error('--period-start is required (or use --data for raw body)');
          }
          if (!options.items) {
            throw new Error('--items is required (or use --data for raw body)');
          }

          body = {
            organization_consumer_id: options.consumerId,
            period_start: options.periodStart,
            items: parseJson(options.items),
          };

          if (options.notifyConsumer === false) {
            body.notify_consumer = false;
          } else if (options.notifyConsumer === true) {
            body.notify_consumer = true;
          }

          if (options.description !== undefined) {
            body.description = options.description;
          }
          if (options.coupons !== undefined) {
            body.coupons = parseJson(options.coupons);
          }
          if (options.untilCycleNumber !== undefined) {
            body.until_cycle_number = options.untilCycleNumber;
          }
          if (options.currency !== undefined) {
            body.currency = options.currency;
          }
          if (options.excludeCouponsIfInstallments) {
            body.exclude_coupons_if_installments = true;
          }
          if (options.overridePaymentMethods !== undefined) {
            body.override_payment_methods = parseJson(options.overridePaymentMethods);
          }
        }

        const result = await client.createSubscription(body);
        OutputFormatter.success('Subscription created successfully');
        if (options.json) {
          OutputFormatter.output(result, { json: true });
        } else if (options.table) {
          OutputFormatter.outputSubscriptionTable({ data: [result] });
        } else {
          OutputFormatter.outputSubscriptionDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to create subscription', error);
        process.exit(1);
      }
    });

  return command;
}
