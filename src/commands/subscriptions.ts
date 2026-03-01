import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter, parseJson } from '../utils';

export function createSubscriptionCommands(): Command {
  const subscription = new Command('subs')
    .description('Manage subscriptions');

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  subscription
    .command('create')
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
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
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

          // notify_consumer defaults to true on the API side; only send if explicitly set to false
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
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to create subscription', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // get
  // ---------------------------------------------------------------------------
  subscription
    .command('get')
    .description('Get a subscription by ID')
    .argument('<id>', 'Subscription ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.getSubscription(id);
        OutputFormatter.success('Subscription retrieved successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to get subscription', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // list
  // ---------------------------------------------------------------------------
  subscription
    .command('list')
    .description('List subscriptions')
    .option('--limit <n>', 'Number of items per page', parseInt)
    .option('--page <n>', 'Page number', parseInt)
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <direction>', 'Sort direction (asc|desc)')
    .option('--search <term>', 'Search term')
    .option('--statuses <csv>', 'Comma-separated status filter (INACTIVE,ACTIVE,EXPIRED,CANCELED,FROZEN)')
    .option('--latest-invoice-paid', 'Filter by latest invoice being paid')
    .option('--latest-invoice-unpaid', 'Filter by latest invoice being unpaid')
    .option('--from-date <datetime>', 'Filter subscriptions from this date')
    .option('--to-date <datetime>', 'Filter subscriptions to this date')
    .option('--from-price <amount>', 'Filter by minimum price')
    .option('--to-price <amount>', 'Filter by maximum price')
    .option('--consumer-id <uuid>', 'Filter by consumer ID (organization_consumer_id)')
    .option('--product-ids <csv>', 'Comma-separated product UUID filter')
    .option('--currencies <csv>', 'Comma-separated currency codes filter')
    .option('--period-start-from <datetime>', 'Filter by current period start from date')
    .option('--period-start-to <datetime>', 'Filter by current period start to date')
    .option('--period-end-from <datetime>', 'Filter by current period end from date')
    .option('--period-end-to <datetime>', 'Filter by current period end to date')
    .option('--format <format>', 'Output format (json|table|pretty)', 'table')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const params: any = {};

        if (options.limit !== undefined) params.limit = options.limit;
        if (options.page !== undefined) params.page = options.page;
        if (options.sortField !== undefined) params.sort_field = options.sortField;
        if (options.sortDirection !== undefined) params.sort_direction = options.sortDirection;
        if (options.search !== undefined) params.search_term = options.search;

        if (options.statuses !== undefined) {
          params.statuses = options.statuses.split(',').map((s: string) => s.trim());
        }

        if (options.latestInvoicePaid) {
          params.latest_invoice_is_paid = true;
        } else if (options.latestInvoiceUnpaid) {
          params.latest_invoice_is_paid = false;
        }

        if (options.fromDate !== undefined) params.from_date = options.fromDate;
        if (options.toDate !== undefined) params.to_date = options.toDate;
        if (options.fromPrice !== undefined) params.from_price = options.fromPrice;
        if (options.toPrice !== undefined) params.to_price = options.toPrice;
        if (options.consumerId !== undefined) params.organization_consumer_id = options.consumerId;

        if (options.productIds !== undefined) {
          params.product_ids = options.productIds.split(',').map((s: string) => s.trim());
        }

        if (options.currencies !== undefined) params.currencies = options.currencies;

        if (options.periodStartFrom !== undefined) params.current_period_start_from_date = options.periodStartFrom;
        if (options.periodStartTo !== undefined) params.current_period_start_to_date = options.periodStartTo;
        if (options.periodEndFrom !== undefined) params.current_period_end_from_date = options.periodEndFrom;
        if (options.periodEndTo !== undefined) params.current_period_end_to_date = options.periodEndTo;

        const result = await client.listSubscriptions(params);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to list subscriptions', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  subscription
    .command('update')
    .description('Update a subscription (items and coupons are full replacements)')
    .argument('<id>', 'Subscription ID')
    .option('--items <json>', 'Full replacement items array, e.g. \'[{"product_id":"uuid","quantity":1,"coupons":[]}]\'')
    .option('--coupons <json>', 'Full replacement coupon UUIDs array, e.g. \'["uuid1"]\'')
    .option('--description <text>', 'Subscription description')
    .option('--until-cycle-number <n>', 'Limit subscription to N billing cycles', parseInt)
    .option('--override-payment-methods <json>', 'Override payment methods as JSON object')
    .option('--data <json>', 'Raw request body as JSON (overrides all other flags)')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
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
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to update subscription', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // cancel
  // ---------------------------------------------------------------------------
  subscription
    .command('cancel')
    .description('Cancel a subscription')
    .argument('<id>', 'Subscription ID')
    .option('--cancel-invoices', 'Also cancel related invoices (cancel_related_invoices: true)')
    .option('--data <json>', 'Raw request body as JSON (overrides all other flags)')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
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
          body = {};
          if (options.cancelInvoices) {
            body.cancel_related_invoices = true;
          }
        }

        const result = await client.cancelSubscription(id, body);
        OutputFormatter.success(`Subscription ${id} cancelled successfully`);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to cancel subscription', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // freeze
  // ---------------------------------------------------------------------------
  subscription
    .command('freeze')
    .description('Create a freeze period for a subscription')
    .argument('<id>', 'Subscription ID')
    .option('--freeze-start <datetime>', 'Freeze start datetime (ISO 8601) — required')
    .option('--freeze-end <datetime>', 'Freeze end datetime (ISO 8601) — optional, omit for indefinite')
    .option('--notes <text>', 'Notes for the freeze period')
    .option('--data <json>', 'Raw request body as JSON (overrides all other flags)')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
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
          if (!options.freezeStart) {
            throw new Error('--freeze-start is required (or use --data for raw body)');
          }

          body = {
            freeze_start_datetime: options.freezeStart,
          };

          if (options.freezeEnd !== undefined) {
            body.freeze_end_datetime = options.freezeEnd;
          }
          if (options.notes !== undefined) {
            body.notes = options.notes;
          }
        }

        const result = await client.freezeSubscription(id, body);
        OutputFormatter.success('Subscription frozen successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to freeze subscription', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // freeze-list
  // ---------------------------------------------------------------------------
  subscription
    .command('freeze-list')
    .description('List all freeze periods for a subscription')
    .argument('<subscription-id>', 'Subscription ID')
    .option('--limit <n>', 'Number of items per page', parseInt)
    .option('--page <n>', 'Page number', parseInt)
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <direction>', 'Sort direction (asc|desc)')
    .option('--format <format>', 'Output format (json|table|pretty)', 'table')
    .action(async (subscriptionId, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const params: any = {};
        if (options.limit !== undefined) params.limit = options.limit;
        if (options.page !== undefined) params.page = options.page;
        if (options.sortField !== undefined) params.sort_field = options.sortField;
        if (options.sortDirection !== undefined) params.sort_direction = options.sortDirection;

        const result = await client.listSubscriptionFreezes(subscriptionId, params);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to list subscription freeze periods', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // freeze-update
  // ---------------------------------------------------------------------------
  subscription
    .command('freeze-update')
    .description('Update a freeze period on a subscription')
    .argument('<subscription-id>', 'Subscription ID')
    .argument('<freeze-id>', 'Freeze period ID')
    .option('--freeze-start <datetime>', 'Freeze start datetime (ISO 8601) — required even if unchanged')
    .option('--freeze-end <datetime>', 'Freeze end datetime (ISO 8601) — send null for indefinite')
    .option('--no-freeze-end', 'Set freeze_end_datetime to null (indefinite freeze)')
    .option('--notes <text>', 'Notes for the freeze period')
    .option('--data <json>', 'Raw request body as JSON (overrides all other flags)')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (subscriptionId, freezeId, options) => {
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
          if (!options.freezeStart) {
            throw new Error('--freeze-start is required (always required, even if unchanged) — or use --data for raw body');
          }

          body = {
            freeze_start_datetime: options.freezeStart,
            // freeze_end_datetime is required by API but may be null (indefinite)
            freeze_end_datetime: options.freezeEnd === false ? null : (options.freezeEnd ?? null),
          };

          if (options.notes !== undefined) {
            body.notes = options.notes;
          }
        }

        const result = await client.updateSubscriptionFreeze(subscriptionId, freezeId, body);
        OutputFormatter.success('Freeze period updated successfully');
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to update freeze period', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // freeze-delete
  // ---------------------------------------------------------------------------
  subscription
    .command('freeze-delete')
    .description('Delete (unfreeze) a specific freeze period from a subscription')
    .argument('<subscription-id>', 'Subscription ID')
    .argument('<freeze-id>', 'Freeze period ID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (subscriptionId, freezeId, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.deleteSubscriptionFreeze(subscriptionId, freezeId);
        OutputFormatter.success(`Freeze period ${freezeId} deleted from subscription ${subscriptionId}`);
        OutputFormatter.output(result, { format: options.format });
      } catch (error) {
        OutputFormatter.error('Failed to delete freeze period', error);
        process.exit(1);
      }
    });

  return subscription;
}
