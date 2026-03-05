import { Command } from 'commander';
import chalk from 'chalk';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createStatusCommand(): Command {
  return new Command('status')
    .description('Show current authentication status')
    .action(async () => {
      try {
        const config = ConfigManager.getConfig();

        if (!config.apiKey) {
          console.log(chalk.yellow('\n  Not logged in'));
          console.log(
            chalk.gray('\n  Run `streampay auth login --api-key <key>` to authenticate'),
          );
          return;
        }

        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });

        const me = await client.getUserAndOrganizationInfo();

        console.log(chalk.green('\n  ✓ Authenticated'));
        console.log(
          `  ${chalk.yellow('Organization')}: ${me.organization?.name ?? chalk.gray('(unknown)')}`,
        );
        console.log(
          `  ${chalk.yellow('User')}:         ${me.user?.email ?? chalk.gray('(unknown)')}`,
        );
        const isSandbox = me.organization?.sandbox;
        const envLabel = isSandbox === true
          ? chalk.yellow.bold('SANDBOX')
          : isSandbox === false
            ? chalk.green.bold('LIVE')
            : chalk.gray('(unknown)');
        console.log(`  ${chalk.yellow('Environment')}: ${envLabel}`);

        if (config.baseUrl) {
          console.log(`  ${chalk.yellow('Base URL')}:     ${config.baseUrl}`);
        }
        if (config.branch) {
          console.log(`  ${chalk.yellow('Branch')}:       ${config.branch}`);
        }
      } catch (error: any) {
        OutputFormatter.error('Failed to verify authentication status', error);
        process.exit(1);
      }
    });
}
