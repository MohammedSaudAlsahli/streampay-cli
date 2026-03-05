import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { OutputFormatter, getMergedFormatOptions } from '../../utils';

export function createEventsCommand(): Command {
  return new Command('events')
    .description('List all supported webhook event types')
    .option('--json', 'output in JSON format')
    .option('--table', 'output in table format')
    .option('--pretty', 'output in pretty format (default)')
    .action(async function(this: Command, options) {
      try {
        const format = getMergedFormatOptions(options, this);
        const events = StreamAppClient.WEBHOOK_EVENTS;
        OutputFormatter.output(events, { json: format.json, table: format.table, pretty: format.pretty });
      } catch (error) {
        OutputFormatter.error('Failed to list webhook events', error);
        process.exit(1);
      }
    });
}
