import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, parseJson } from '../../utils';

const VALID_STATUSES = ['ACTIVE', 'INACTIVE', 'COMPLETED'];

export function createCheckoutUpdateStatusCommand(): Command {
  const command = new Command('update-status')
    .description('Update the status of a payment link')
    .argument('<id>', 'Payment link ID')
    .option('--status <status>', 'New status (ACTIVE|INACTIVE|COMPLETED)')
    .option('--deactivate-message <msg>', 'Optional deactivation message')
    .option('--data <json>', 'Raw JSON body (skips flag logic)')
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
          if (!options.status) {
            throw new Error('--status is required when not using --data. Must be one of: ACTIVE, INACTIVE, COMPLETED');
          }
          if (!VALID_STATUSES.includes(options.status)) {
            throw new Error(
              `Invalid status "${options.status}". Must be one of: ${VALID_STATUSES.join(', ')}`,
            );
          }

          body = { status: options.status };
          if (options.deactivateMessage !== undefined) {
            body.deactivate_message = options.deactivateMessage;
          }
        }

        const result = await client.updatePaymentLinkStatus(id, body);
        OutputFormatter.success('Payment link status updated successfully');
        if (options.pretty) {
          OutputFormatter.outputCheckoutDetail(result);
        } else {
          OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
        }
      } catch (error) {
        OutputFormatter.error('Failed to update payment link status', error);
        process.exit(1);
      }
    });

  return command;
}
