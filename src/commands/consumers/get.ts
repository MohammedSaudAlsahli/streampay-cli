import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, getMergedFormatOptions } from '../../utils';

export function createConsumersGetCommand(): Command {
  const command = new Command('get')
    .description('Get a consumer by ID (requires consumer ID)')
    .argument('<id>', 'Consumer UUID (required)')
    .option('--json', 'Output in JSON format')
    .option('--table', 'Output in table format')
    .option('--pretty', 'Output in pretty format (default)')
    .action(async function(this: Command, id, options) {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({ apiKey: ConfigManager.getApiKey(), ...config });

        const result = await client.getConsumer(id);
        OutputFormatter.success('Consumer retrieved successfully');
        const format = getMergedFormatOptions(options, this);
        if (format.json) {
          OutputFormatter.output(result, { json: true });
        } else if (format.table) {
          OutputFormatter.outputConsumerTable({ data: [result] });
        } else {
          OutputFormatter.outputConsumerDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to get consumer', error);
        process.exit(1);
      }
    });

  return command;
}
