import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, getMergedFormatOptions } from '../../utils';

const VALID_REFUND_REASONS = ['REQUESTED_BY_CUSTOMER', 'DUPLICATE', 'FRAUDULENT', 'OTHER'];

function createClient(): StreamAppClient {
  const config = ConfigManager.getConfig();
  return new StreamAppClient({
    apiKey: ConfigManager.getApiKey(),
    ...config,
  });
}

export function createPaymentsRefundCommand(): Command {
  const cmd = new Command('refund');

  cmd
    .description('Refund a payment')
    .argument('<id>', 'Payment ID (UUID)')
    .requiredOption(
      '--refund-reason <reason>',
      `Reason for the refund. Valid: ${VALID_REFUND_REASONS.join(', ')}`,
    )
    .option('--refund-note <note>', 'Optional note explaining the refund')
    .option(
      '--allow-multiple',
      'If the payment is part of a multi-payment transaction, refund all related payments',
    )
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format')
    .option('--pretty', 'output in pretty format (default)')
    .action(async function(this: Command, id, options) {
      try {
        const reason = options.refundReason.toUpperCase();
        if (!VALID_REFUND_REASONS.includes(reason)) {
          OutputFormatter.error(
            `Invalid refund reason: "${options.refundReason}". Valid values: ${VALID_REFUND_REASONS.join(', ')}`
          );
          process.exit(1);
        }

        const client = createClient();
        const data: any = { refund_reason: reason };
        if (options.refundNote) data.refund_note = options.refundNote;
        if (options.allowMultiple) data.allow_refund_multiple_related_payments = true;

        const result = await client.refundPayment(id, data);
        OutputFormatter.success('Payment refunded successfully');
        const format = getMergedFormatOptions(options, this);
        OutputFormatter.outputPaymentDetail(result, format);
      } catch (error) {
        OutputFormatter.error('Failed to refund payment', error);
        process.exit(1);
      }
    });

  return cmd;
}
