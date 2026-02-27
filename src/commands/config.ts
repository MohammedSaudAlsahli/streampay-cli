import { Command } from 'commander';
import { ConfigManager } from '../config';
import { StreamAppClient } from '../client';
import { OutputFormatter } from '../utils';
import chalk from 'chalk';

function maskSecret(value: string): string {
  if (value.length <= 4) {
    return '***' + value;
  }
  return '***' + value.slice(-4);
}

// ---------------------------------------------------------------------------
// streampay login
// ---------------------------------------------------------------------------
export function createLoginCommand(): Command {
  const login = new Command('login')
    .description('Authenticate with the StreamPay API')
    .option('--api-key <key>', 'API key')
    .option('--api-secret <secret>', 'API secret')
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

        // Persist credentials
        const updates: Record<string, string> = { apiKey };
        if (apiSecret) updates.apiSecret = apiSecret;
        if (branch) updates.branch = branch;
        if (baseUrl) updates.baseUrl = baseUrl;

        ConfigManager.saveConfig(updates);

        // Verify credentials against the API
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
          `  ${chalk.yellow('User')}:         ${me.user?.email ?? me.email ?? chalk.gray('(unknown)')}`,
        );
        console.log(
          `  ${chalk.yellow('Environment')}: ${me.environment ?? me.mode ?? chalk.gray('(unknown)')}`,
        );
      } catch (error: any) {
        OutputFormatter.error('Authentication failed', error);
        process.exit(1);
      }
    });

  return login;
}

// ---------------------------------------------------------------------------
// streampay logout
// ---------------------------------------------------------------------------
export function createLogoutCommand(): Command {
  const logout = new Command('logout')
    .description('Clear stored credentials')
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

  return logout;
}

// ---------------------------------------------------------------------------
// streampay config  (set | get | clear | path)
// ---------------------------------------------------------------------------
export function createConfigCommand(): Command {
  const config = new Command('config')
    .description('Manage CLI configuration');

  // -- config set --------------------------------------------------------------
  config
    .command('set')
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

  // -- config get --------------------------------------------------------------
  config
    .command('get')
    .description('Display current configuration')
    .option('--show-secrets', 'Show full API key and secret (use carefully!)')
    .action((options) => {
      try {
        const currentConfig = ConfigManager.getConfig();

        console.log(chalk.cyan('\nCurrent Configuration:\n'));

        // API Key
        if (currentConfig.apiKey) {
          const display = options.showSecrets
            ? currentConfig.apiKey
            : maskSecret(currentConfig.apiKey);
          console.log(`  ${chalk.yellow('API Key')}:        ${display}`);
        } else {
          console.log(`  ${chalk.yellow('API Key')}:        ${chalk.gray('(not set)')}`);
        }

        // API Secret
        if (currentConfig.apiSecret) {
          const display = options.showSecrets
            ? currentConfig.apiSecret
            : maskSecret(currentConfig.apiSecret);
          console.log(`  ${chalk.yellow('API Secret')}:     ${display}`);
        } else {
          console.log(`  ${chalk.yellow('API Secret')}:     ${chalk.gray('(not set)')}`);
        }

        // Other values
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

  // -- config clear ------------------------------------------------------------
  config
    .command('clear')
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

  // -- config path -------------------------------------------------------------
  config
    .command('path')
    .description('Show the config file path')
    .action(() => {
      try {
        console.log(ConfigManager.getConfigPath());
      } catch (error: any) {
        OutputFormatter.error('Failed to resolve config path', error);
        process.exit(1);
      }
    });

  return config;
}
