import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, parseJson } from '../../utils';

export function createSubscriptionFreezeUpdateCommand(): Command {
  const command = new Command('freeze-update')
    .description('Update a freeze period on a subscription')
    .argument('<subscription-id>', 'Subscription ID')
    .argument('<freeze-id>', 'Freeze period ID')
    .option('--freeze-start <datetime>', 'Freeze start datetime (ISO 8601) — required even if unchanged')
    .option('--freeze-end <datetime>', 'Freeze end datetime (ISO 8601) — send null for indefinite')
    .option('--no-freeze-end', 'Set freeze_end_datetime to null (indefinite freeze)')
    .option('--notes <text>', 'Notes for the freeze period')
    .option('--data <json>', 'Raw request body as JSON (overrides all other flags)')
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format')
    .option('--pretty', 'output in pretty format (default)')
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
            freeze_end_datetime: options.freezeEnd === false ? null : (options.freezeEnd ?? null),
          };

          if (options.notes !== undefined) {
            body.notes = options.notes;
          }
        }

        const result = await client.updateSubscriptionFreeze(subscriptionId, freezeId, body);
        OutputFormatter.success('Freeze period updated successfully');
        OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
      } catch (error) {
        OutputFormatter.error('Failed to update freeze period', error);
        process.exit(1);
      }
    });

  return command;
}
