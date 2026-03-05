import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, parseJson } from '../../utils';

export function createSubscriptionFreezeCommand(): Command {
  const command = new Command('freeze')
    .description('Create a freeze period for a subscription')
    .argument('<id>', 'Subscription ID')
    .option('--freeze-start <datetime>', 'Freeze start datetime (ISO 8601) — required')
    .option('--freeze-end <datetime>', 'Freeze end datetime (ISO 8601) — optional, omit for indefinite')
    .option('--notes <text>', 'Notes for the freeze period')
    .option('--data <json>', 'Raw request body as JSON (overrides all other flags)')
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
        OutputFormatter.output(result, { json: options.json, table: options.table, pretty: options.pretty });
      } catch (error) {
        OutputFormatter.error('Failed to freeze subscription', error);
        process.exit(1);
      }
    });

  return command;
}
