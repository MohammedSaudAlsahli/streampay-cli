import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter } from '../utils';
import chalk from 'chalk';

function formatDate(iso: string): string {
  return iso ? iso.slice(0, 10) : chalk.gray('—');
}

function renderPretty(me: any): void {
  const user = me.user ?? {};
  const org = me.organization ?? {};
  const currency = org.currency_config ?? {};

  const enName =
    user.en_first_name || user.en_last_name
      ? `${user.en_first_name ?? ''} ${user.en_last_name ?? ''}`.trim()
      : null;

  const orgNameEn = org.name_en ?? null;

  const isSandbox: boolean | undefined = org.sandbox;
  const envLabel =
    isSandbox === true
      ? chalk.yellow.bold('SANDBOX')
      : isSandbox === false
        ? chalk.green.bold('LIVE')
        : chalk.gray('(unknown)');

  const enabledCurrencies: string[] = Array.isArray(currency.enabled_currencies)
    ? currency.enabled_currencies
    : [];

  const lbl = (text: string): string => chalk.yellow(text.padEnd(16));

  console.log('');
  console.log(chalk.gray('  ── User ────────────────────────────────────────────'));
  console.log(`  ${lbl('ID')}${chalk.gray(user.id ?? '—')}`);
  console.log(`  ${lbl('Email')}${chalk.white(user.email ?? chalk.gray('—'))}`);
  console.log(
    `  ${lbl('Name')}${chalk.white(
      `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || chalk.gray('—'),
    )}`,
  );
  console.log(
    `  ${lbl('Name (EN)')}${enName ? chalk.white(enName) : chalk.gray('—')}`,
  );
  console.log(`  ${lbl('Member Since')}${chalk.blue(formatDate(user.created_at))}`);

  console.log('');
  console.log(chalk.gray('  ── Organization ────────────────────────────────────'));
  console.log(`  ${lbl('ID')}${chalk.gray(org.id ?? '—')}`);
  console.log(`  ${lbl('Name')}${chalk.white(org.name ?? chalk.gray('—'))}`);
  console.log(
    `  ${lbl('Name (EN)')}${orgNameEn ? chalk.white(orgNameEn) : chalk.gray('—')}`,
  );
  console.log(`  ${lbl('Environment')}${envLabel}`);
  console.log(`  ${lbl('Created')}${chalk.blue(formatDate(org.created_at))}`);

  console.log('');
  console.log(chalk.gray('  ── Currency Config ─────────────────────────────────'));
  console.log(
    `  ${lbl('Home Currency')}${chalk.cyan(currency.home_currency ?? chalk.gray('—'))}`,
  );
  console.log(
    `  ${lbl('Default')}${chalk.cyan(currency.default_currency ?? chalk.gray('—'))}`,
  );
  console.log(
    `  ${lbl('Enabled')}${
      enabledCurrencies.length > 0
        ? chalk.cyan(enabledCurrencies.join(', '))
        : chalk.gray('—')
    }`,
  );
  console.log('');
}

export function createMeCommand(): Command {
  const me = new Command('me')
    .description('Show authenticated user and organization info')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({
          apiKey: ConfigManager.getApiKey(),
          ...config,
        });
        const result = await client.getUserAndOrganizationInfo();
        OutputFormatter.success('User and organization info retrieved successfully');

        if (options.format === 'pretty') {
          renderPretty(result);
        } else if (options.format === 'json') {
          OutputFormatter.output(result, { format: 'json' });
        } else {
          OutputFormatter.output(result, { format: 'table' });
        }
      } catch (error) {
        OutputFormatter.error('Failed to retrieve user info', error);
        process.exit(1);
      }
    });

  return me;
}
