import { Command } from 'commander';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createConfigClearCommand(): Command {
  return new Command('clear')
    .description('Clear all configuration')
    .action(() => {
      try {
        ConfigManager.clearConfig();
        OutputFormatter.success('Configuration cleared successfully');
        OutputFormatter.info(
          'Environment variables and .env files are still active',
        );
      } catch (error: any) {
        OutputFormatter.error('Failed to clear configuration', error);
        process.exit(1);
      }
    });
}
