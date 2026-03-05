import { Command } from 'commander';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createConfigPathCommand(): Command {
  return new Command('path')
    .description('Show the config file path')
    .action(() => {
      try {
        console.log(ConfigManager.getConfigPath());
      } catch (error: any) {
        OutputFormatter.error('Failed to resolve config path', error);
        process.exit(1);
      }
    });
}
