import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createConsumersDeleteCommand(): Command {
  const command = new Command('delete')
    .description('Delete a consumer (requires consumer ID)')
    .argument('<id>', 'Consumer UUID (required)')
    .action(async (id) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({ apiKey: ConfigManager.getApiKey(), ...config });

        await client.deleteConsumer(id);
        OutputFormatter.success('Consumer deleted successfully');
      } catch (error) {
        OutputFormatter.error('Failed to delete consumer', error);
        process.exit(1);
      }
    });

  return command;
}
