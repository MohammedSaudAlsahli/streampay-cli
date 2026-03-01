import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter, parseJson } from '../utils';

const VALID_INVOICE_STATUSES = ['DRAFT', 'CREATED', 'SENT', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELED', 'EXPIRED'];
const VALID_PAYMENT_STATUSES = ['PENDING', 'PROCESSING', 'FAILED_INITIATION', 'SUCCEEDED', 'FAILED', 'CANCELED', 'UNDER_REVIEW', 'EXPIRED', 'SETTLED', 'REFUNDED'];
const VALID_CURRENCIES = ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'BHD', 'KWD', 'OMR', 'QAR'];
const VALID_SORT_DIRECTIONS = ['asc', 'desc'];

export function createInvoiceCommands(): Command {
  const invoice = new Command('invoices')
    .description('Manage invoices');

  // -------------------------------------------------------------------------
  // create
  // -------------------------------------------------------------------------
  invoice
    .command('create')
    .description('Create a new invoice')
    .requiredOption('--consumer-id <uuid>', 'Consumer UUID (organization_consumer_id)')
    .requiredOption('--scheduled-on <datetime>', 'Payment due date (ISO 8601, e.g. 2026-04-01T00:00:00Z)')
    .requiredOption('--items <json>', 'Items as JSON array, e.g. \'[{"product_id":"uuid","quantity":1}]\'')
    .requiredOption('--payment-methods <json>', 'Payment methods as JSON object, e.g. \'{"mada":true,"visa":true,"mastercard":true,"amex":false,"bank_transfer":false,"installment":false,"qurrah":false}\'')
    .option('--description <text>', 'Invoice description (max 500 chars)')
    .option('--notify-consumer', 'Send notification to consumer (default: true)')
    .option('--no-notify-consumer', 'Do not send notification to consumer')
    .option('--coupons <json>', 'Invoice-level coupon UUIDs as JSON array, e.g. \'["uuid1","uuid2"]\'')
    .option('--exclude-coupons-if-installments', 'Exclude coupons when consumer pays by installments')
    .option('--currency <code>', 'Currency code (SAR|USD|EUR|GBP|AED|BHD|KWD|OMR|QAR)', 'SAR')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const items = parseJson(options.items);

        const paymentMethods = parseJson(options.paymentMethods);

        const data: any = {
          organization_consumer_id: options.consumerId,
          scheduled_on: options.scheduledOn,
          items,
          payment_methods: paymentMethods,
        };

        if (options.description) {
          data.description = options.description;
        }
        if (options.notifyConsumer === false) {
          data.notify_consumer = false;
        }
        if (options.coupons) {
          data.coupons = parseJson(options.coupons);
        }
        if (options.excludeCouponsIfInstallments) {
          data.exclude_coupons_if_installments = true;
        }
        if (options.currency) {
          if (!VALID_CURRENCIES.includes(options.currency.toUpperCase())) {
            throw new Error(`Invalid currency "${options.currency}". Must be one of: ${VALID_CURRENCIES.join(', ')}`);
          }
          data.currency = options.currency.toUpperCase();
        }

        const result = await client.createInvoice(data);
        OutputFormatter.success('Invoice created successfully');
        if (options.format === 'pretty') {
          OutputFormatter.outputInvoiceDetail(result);
        } else {
          OutputFormatter.output(result, { format: options.format });
        }
      } catch (error) {
        OutputFormatter.error('Failed to create invoice', error);
        process.exit(1);
      }
    });

  // -------------------------------------------------------------------------
  // get
  // -------------------------------------------------------------------------
  invoice
    .command('get')
    .description('Get an invoice by ID')
    .argument('<id>', 'Invoice UUID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.getInvoice(id);
        if (options.format === 'pretty') {
          OutputFormatter.outputInvoiceDetail(result);
        } else {
          OutputFormatter.output(result, { format: options.format });
        }
      } catch (error) {
        OutputFormatter.error('Failed to get invoice', error);
        process.exit(1);
      }
    });

  // -------------------------------------------------------------------------
  // list
  // -------------------------------------------------------------------------
  invoice
    .command('list')
    .description('List invoices with filtering and pagination')
    .option('--page <number>', 'Page number (default: 1)', parseInt)
    .option('--limit <number>', 'Items per page, max 100 (default: 10)', parseInt)
    .option('--sort-field <field>', 'Field to sort by (e.g. amount, scheduled_on)')
    .option('--sort-direction <direction>', 'Sort direction: asc|desc')
    .option('--search-term <query>', 'Free-text search across invoices')
    .option('--include-payments', 'Include payment objects in each invoice')
    .option('--payment-link-id <uuid>', 'Filter by payment link UUID')
    .option('--statuses <statuses>', 'Filter by invoice statuses, comma-separated (DRAFT|CREATED|SENT|ACCEPTED|REJECTED|COMPLETED|CANCELED|EXPIRED)')
    .option('--payment-statuses <statuses>', 'Filter by payment statuses, comma-separated (PENDING|PROCESSING|FAILED_INITIATION|SUCCEEDED|FAILED|CANCELED|UNDER_REVIEW|EXPIRED|SETTLED|REFUNDED)')
    .option('--from-date <datetime>', 'Filter invoices created on or after this date (ISO 8601)')
    .option('--to-date <datetime>', 'Filter invoices created on or before this date (ISO 8601)')
    .option('--due-date-from <datetime>', 'Filter invoices with due date on or after this date (ISO 8601)')
    .option('--due-date-to <datetime>', 'Filter invoices with due date on or before this date (ISO 8601)')
    .option('--from-price <amount>', 'Filter invoices with total amount >= this value', parseFloat)
    .option('--to-price <amount>', 'Filter invoices with total amount <= this value', parseFloat)
    .option('--consumer-id <uuid>', 'Filter by consumer UUID (organization_consumer_id)')
    .option('--subscription-id <uuid>', 'Filter by subscription UUID')
    .option('--currencies <codes>', 'Filter by currency codes, comma-separated (e.g. SAR,USD)')
    .option('--payments-not-settled', 'Only return invoices with unsettled SUCCEEDED card/wallet payments')
    .option('--format <format>', 'Output format (json|table|pretty)', 'table')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const params: any = {};
        if (options.page) params.page = options.page;
        if (options.limit) params.limit = options.limit;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) {
          if (!VALID_SORT_DIRECTIONS.includes(options.sortDirection)) {
            throw new Error(`Invalid sort direction "${options.sortDirection}". Must be one of: ${VALID_SORT_DIRECTIONS.join(', ')}`);
          }
          params.sort_direction = options.sortDirection;
        }
        if (options.searchTerm) params.search_term = options.searchTerm;
        if (options.includePayments) params.include_payments = true;
        if (options.paymentLinkId) params.payment_link_id = options.paymentLinkId;
        if (options.statuses) {
          const statusList = options.statuses.split(',').map((s: string) => s.trim().toUpperCase());
          for (const s of statusList) {
            if (!VALID_INVOICE_STATUSES.includes(s)) {
              throw new Error(`Invalid invoice status "${s}". Must be one of: ${VALID_INVOICE_STATUSES.join(', ')}`);
            }
          }
          params.statuses = statusList;
        }
        if (options.paymentStatuses) {
          const payStatusList = options.paymentStatuses.split(',').map((s: string) => s.trim().toUpperCase());
          for (const s of payStatusList) {
            if (!VALID_PAYMENT_STATUSES.includes(s)) {
              throw new Error(`Invalid payment status "${s}". Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}`);
            }
          }
          params.payment_statuses = payStatusList;
        }
        if (options.fromDate) params.from_date = options.fromDate;
        if (options.toDate) params.to_date = options.toDate;
        if (options.dueDateFrom) params.due_date_from = options.dueDateFrom;
        if (options.dueDateTo) params.due_date_to = options.dueDateTo;
        if (options.fromPrice !== undefined) params.from_price = options.fromPrice;
        if (options.toPrice !== undefined) params.to_price = options.toPrice;
        if (options.consumerId) params.organization_consumer_id = options.consumerId;
        if (options.subscriptionId) params.subscription_id = options.subscriptionId;
        if (options.currencies) params.currencies = options.currencies;
        if (options.paymentsNotSettled) params.payments_not_settled = true;

        const result = await client.listInvoices(params);
        if (options.format === 'table') {
          OutputFormatter.outputInvoiceTable(result);
        } else {
          OutputFormatter.output(result, { format: options.format });
        }
      } catch (error) {
        OutputFormatter.error('Failed to list invoices', error);
        process.exit(1);
      }
    });

  // -------------------------------------------------------------------------
  // update (in-place: only scheduled_on and description)
  // -------------------------------------------------------------------------
  invoice
    .command('update')
    .description('Update an invoice in-place (only scheduled_on and description can be changed)')
    .argument('<id>', 'Invoice UUID')
    .option('--scheduled-on <datetime>', 'New payment due date (ISO 8601, must be a future date)')
    .option('--description <text>', 'Updated description/notes (max 500 chars)')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const data: any = {};
        if (options.scheduledOn) data.scheduled_on = options.scheduledOn;
        if (options.description) data.description = options.description;

        if (Object.keys(data).length === 0) {
          throw new Error('At least one field must be provided to update (--scheduled-on or --description)');
        }

        const result = await client.updateInvoiceInPlace(id, data);
        OutputFormatter.success('Invoice updated successfully');
        if (options.format === 'pretty') {
          OutputFormatter.outputInvoiceDetail(result);
        } else {
          OutputFormatter.output(result, { format: options.format });
        }
      } catch (error) {
        OutputFormatter.error('Failed to update invoice', error);
        process.exit(1);
      }
    });

  // -------------------------------------------------------------------------
  // send
  // -------------------------------------------------------------------------
  invoice
    .command('send')
    .description('Send an invoice to the consumer')
    .argument('<id>', 'Invoice UUID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.sendInvoice(id);
        OutputFormatter.success('Invoice sent successfully');
        if (options.format === 'pretty') {
          OutputFormatter.outputInvoiceDetail(result);
        } else {
          OutputFormatter.output(result, { format: options.format });
        }
      } catch (error) {
        OutputFormatter.error('Failed to send invoice', error);
        process.exit(1);
      }
    });

  // -------------------------------------------------------------------------
  // accept
  // -------------------------------------------------------------------------
  invoice
    .command('accept')
    .description('Accept an invoice')
    .argument('<id>', 'Invoice UUID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.acceptInvoice(id);
        OutputFormatter.success('Invoice accepted successfully');
        if (options.format === 'pretty') {
          OutputFormatter.outputInvoiceDetail(result);
        } else {
          OutputFormatter.output(result, { format: options.format });
        }
      } catch (error) {
        OutputFormatter.error('Failed to accept invoice', error);
        process.exit(1);
      }
    });

  // -------------------------------------------------------------------------
  // reject
  // -------------------------------------------------------------------------
  invoice
    .command('reject')
    .description('Reject an invoice')
    .argument('<id>', 'Invoice UUID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.rejectInvoice(id);
        OutputFormatter.success('Invoice rejected successfully');
        if (options.format === 'pretty') {
          OutputFormatter.outputInvoiceDetail(result);
        } else {
          OutputFormatter.output(result, { format: options.format });
        }
      } catch (error) {
        OutputFormatter.error('Failed to reject invoice', error);
        process.exit(1);
      }
    });

  // -------------------------------------------------------------------------
  // complete
  // -------------------------------------------------------------------------
  invoice
    .command('complete')
    .description('Mark an invoice as completed')
    .argument('<id>', 'Invoice UUID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.completeInvoice(id);
        OutputFormatter.success('Invoice completed successfully');
        if (options.format === 'pretty') {
          OutputFormatter.outputInvoiceDetail(result);
        } else {
          OutputFormatter.output(result, { format: options.format });
        }
      } catch (error) {
        OutputFormatter.error('Failed to complete invoice', error);
        process.exit(1);
      }
    });

  // -------------------------------------------------------------------------
  // cancel
  // -------------------------------------------------------------------------
  invoice
    .command('cancel')
    .description('Cancel an invoice')
    .argument('<id>', 'Invoice UUID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const result = await client.cancelInvoice(id);
        OutputFormatter.success('Invoice cancelled successfully');
        if (options.format === 'pretty') {
          OutputFormatter.outputInvoiceDetail(result);
        } else {
          OutputFormatter.output(result, { format: options.format });
        }
      } catch (error) {
        OutputFormatter.error('Failed to cancel invoice', error);
        process.exit(1);
      }
    });

  return invoice;
}
