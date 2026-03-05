import { Command } from 'commander';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createLogoutCommand(): Command {
  return new Command('logout')
    .description('Clear stored authentication credentials')
    .action(() => {
      try {
        ConfigManager.clearConfig();
        OutputFormatter.success('Logged out — credentials cleared');
        OutputFormatter.info(
          'Environment variables and .env files are still active',
        );
      } catch (error: any) {
        OutputFormatter.error('Failed to clear credentials', error);
        process.exit(1);
      }
    });
}
