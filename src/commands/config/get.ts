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

export function createConfigGetCommand(): Command {
  return new Command('get')
    .description('Display current configuration')
    .option('--show-secrets', 'Show full API key and secret (use carefully!)')
    .action((options) => {
      try {
        const currentConfig = ConfigManager.getConfig();

        console.log(chalk.cyan('\nCurrent Configuration:\n'));

        if (currentConfig.apiKey) {
          const display = options.showSecrets
            ? currentConfig.apiKey
            : maskSecret(currentConfig.apiKey);
          console.log(`  ${chalk.yellow('API Key')}:        ${display}`);
        } else {
          console.log(`  ${chalk.yellow('API Key')}:        ${chalk.gray('(not set)')}`);
        }

        if (currentConfig.apiSecret) {
          const display = options.showSecrets
            ? currentConfig.apiSecret
            : maskSecret(currentConfig.apiSecret);
          console.log(`  ${chalk.yellow('API Secret')}:     ${display}`);
        } else {
          console.log(`  ${chalk.yellow('API Secret')}:     ${chalk.gray('(not set)')}`);
        }

        console.log(
          `  ${chalk.yellow('Base URL')}:       ${currentConfig.baseUrl || chalk.gray('(default)')}`,
        );
        console.log(
          `  ${chalk.yellow('Branch')}:         ${currentConfig.branch || chalk.gray('(not set)')}`,
        );
        console.log(
          `  ${chalk.yellow('Default Format')}: ${currentConfig.defaultFormat || chalk.gray('(pretty)')}`,
        );

        console.log(
          chalk.gray('\n  Configuration sources (in order of priority):'),
        );
        console.log(
          chalk.gray('    1. CLI flags (--api-key, --base-url, --branch)'),
        );
        console.log(
          chalk.gray('    2. Environment variables (STREAMPAY_API_KEY, etc.)'),
        );
        console.log(
          chalk.gray('    3. Config file (~/.streampay/config.json)'),
        );
        console.log(
          chalk.gray('    4. .env file in current directory'),
        );
      } catch (error: any) {
        OutputFormatter.error('Failed to read configuration', error);
        process.exit(1);
      }
    });
}
