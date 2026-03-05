import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, getMergedFormatOptions } from '../../utils';

function createClient(): StreamAppClient {
  const config = ConfigManager.getConfig();
  return new StreamAppClient({
    apiKey: ConfigManager.getApiKey(),
    ...config,
  });
}

export function createPaymentsAutoChargeCommand(): Command {
  const cmd = new Command('auto-charge');

  cmd
    .description('Charge a payment using the consumer\'s latest tokenized card (restricted API)')
    .argument('<payment-id>', 'Payment ID (UUID)')
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format')
    .option('--pretty', 'output in pretty format (default)')
    .action(async function(this: Command, paymentId, options) {
      try {
        const client = createClient();
        const result = await client.autoChargeOnDemand(paymentId);
        OutputFormatter.success('Payment charged successfully');
        const format = getMergedFormatOptions(options, this);
        OutputFormatter.output(result, format);
      } catch (error) {
        OutputFormatter.error('Failed to auto-charge payment', error);
        process.exit(1);
      }
    });

  return cmd;
}
