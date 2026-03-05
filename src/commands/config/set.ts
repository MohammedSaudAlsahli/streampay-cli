import { Command } from 'commander';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';
import chalk from 'chalk';

function maskSecret(value: string): string {
  if (value.length <= 4) {
    return '***' + value;
  }
  return '***' + value.slice(-4);
}

export function createConfigSetCommand(): Command {
  return new Command('set')
    .description('Set configuration values')
    .option('--api-key <key>', 'Set API key')
    .option('--api-secret <secret>', 'Set API secret')
    .option('--base-url <url>', 'Set base URL')
    .option('--branch <branch>', 'Set default branch')
    .option('--format <format>', 'Set default output format (json|table|pretty)')
    .action((options) => {
      try {
        const updates: Record<string, string> = {};

        if (options.apiKey) updates.apiKey = options.apiKey;
        if (options.apiSecret) updates.apiSecret = options.apiSecret;
        if (options.baseUrl) updates.baseUrl = options.baseUrl;
        if (options.branch) updates.branch = options.branch;
        if (options.format) updates.defaultFormat = options.format;

        if (Object.keys(updates).length === 0) {
          OutputFormatter.warning('No configuration values provided');
          return;
        }

        ConfigManager.saveConfig(updates);
        OutputFormatter.success('Configuration updated successfully');

        console.log(chalk.cyan('\nUpdated values:'));
        for (const [key, value] of Object.entries(updates)) {
          const display =
            key === 'apiKey' || key === 'apiSecret'
              ? maskSecret(String(value))
              : value;
          console.log(`  ${chalk.yellow(key)}: ${display}`);
        }
      } catch (error: any) {
        OutputFormatter.error('Failed to update configuration', error);
        process.exit(1);
      }
    });
}
