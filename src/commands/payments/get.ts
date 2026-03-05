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

export function createPaymentsGetCommand(): Command {
  const cmd = new Command('get');

  cmd
    .description('Get a payment by ID')
    .argument('<id>', 'Payment ID (UUID)')
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format')
    .option('--pretty', 'output in pretty format (default)')
    .action(async function(this: Command, id, options) {
      try {
        const client = createClient();
        const result = await client.getPayment(id);
        const format = getMergedFormatOptions(options, this);
        OutputFormatter.outputPaymentDetail(result, format);
      } catch (error) {
        OutputFormatter.error('Failed to get payment', error);
        process.exit(1);
      }
    });

  return cmd;
}
