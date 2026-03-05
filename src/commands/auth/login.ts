import { Command } from 'commander';
import chalk from 'chalk';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter } from '../../utils';

export function createLoginCommand(): Command {
  return new Command('login')
    .description('Authenticate with StreamPay API')
    .option('--api-key <key>', 'API key (required)')
    .option('--api-secret <secret>', 'API secret (optional, for enhanced auth)')
    .option('--branch <branch>', 'Default branch')
    .option('--base-url <url>', 'API base URL')
    .action(async (options) => {
      try {
        const apiKey: string | undefined =
          options.apiKey || process.env.STREAMPAY_API_KEY;
        const apiSecret: string | undefined =
          options.apiSecret || process.env.STREAMPAY_API_SECRET;
        const branch: string | undefined =
          options.branch || process.env.STREAMPAY_BRANCH;
        const baseUrl: string | undefined =
          options.baseUrl || process.env.STREAMPAY_BASE_URL;

        if (!apiKey) {
          OutputFormatter.error(
            'API key is required. Provide --api-key or set STREAMPAY_API_KEY.',
          );
          process.exit(1);
        }

        const updates: Record<string, string> = { apiKey };
        if (apiSecret) updates.apiSecret = apiSecret;
        if (branch) updates.branch = branch;
        if (baseUrl) updates.baseUrl = baseUrl;

        ConfigManager.saveConfig(updates);

        const client = new StreamAppClient({
          apiKey,
          apiSecret,
          baseUrl,
          branch,
        });

        const me = await client.getUserAndOrganizationInfo();

        OutputFormatter.success('Authenticated successfully');
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
      } catch (error: any) {
        OutputFormatter.error('Authentication failed', error);
        process.exit(1);
      }
    });
}
