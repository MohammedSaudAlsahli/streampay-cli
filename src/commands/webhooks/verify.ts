import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { OutputFormatter } from '../../utils';

export function createVerifyCommand(): Command {
  return new Command('verify')
    .description('Verify a webhook signature')
    .requiredOption('--signature <signature>', 'The x-stream-signature header value')
    .requiredOption('--body <body>', 'The raw request body as string')
    .requiredOption('--secret <secret>', 'The webhook secret')
    .action(async (options) => {
      try {
        const isValid = StreamAppClient.verifyWebhookSignature(
          options.body,
          options.signature,
          options.secret,
        );

        if (isValid) {
          OutputFormatter.success('Webhook signature is valid');
        } else {
          OutputFormatter.error('Webhook signature is invalid');
          process.exit(1);
        }
      } catch (error) {
        OutputFormatter.error('Failed to verify webhook signature', error);
        process.exit(1);
      }
    });
}
