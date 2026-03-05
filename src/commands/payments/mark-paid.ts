import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

const VALID_MANUAL_PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'CARD', 'QURRAH'];

function createClient(): StreamAppClient {
  const config = ConfigManager.getConfig();
  return new StreamAppClient({
    apiKey: ConfigManager.getApiKey(),
    ...config,
  });
}

export function createPaymentsMarkPaidCommand(): Command {
  const cmd = new Command('mark-paid');

  cmd
    .description('Manually mark a payment as paid (manual methods only)')
    .argument('<id>', 'Payment ID (UUID)')
    .requiredOption(
      '--payment-method <method>',
      `Manual payment method. Valid: ${VALID_MANUAL_PAYMENT_METHODS.join(', ')}`,
    )
    .option('--note <note>', 'Note or reference number (e.g. transaction ID, receipt number)')
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format')
    .option('--pretty', 'output in pretty format (default)')
    .action(async (id, options) => {
      try {
        const method = options.paymentMethod.toUpperCase();
        if (!VALID_MANUAL_PAYMENT_METHODS.includes(method)) {
          OutputFormatter.error(
            `Invalid payment method: "${options.paymentMethod}". ` +
            `Only manual methods are allowed: ${VALID_MANUAL_PAYMENT_METHODS.join(', ')}`
          );
          process.exit(1);
        }

        const client = createClient();
        const data: any = { payment_method: method };
        if (options.note) data.note = options.note;

        await client.markPaymentAsPaid(id, data);
        OutputFormatter.success('Payment marked as paid successfully');
      } catch (error) {
        OutputFormatter.error('Failed to mark payment as paid', error);
        process.exit(1);
      }
    });

  return cmd;
}
