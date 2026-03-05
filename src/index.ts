#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config();

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { createConsumersCommands } from './commands/consumers';
import { createPaymentsCommands } from './commands/payments';
import { createInvoiceCommands } from './commands/invoices';
import { createCheckoutCommands } from './commands/checkout';
import { createSubscriptionCommands } from './commands/subscriptions';
import { createProductCommands } from './commands/products';
import { createCouponsCommands } from './commands/coupons';
import { createWebhookCommands } from './commands/webhooks';
import { createAuthCommands } from './commands/auth';
import { createConfigCommand } from './commands/config';
import { createMeCommand } from './commands/me';

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
);
const version = packageJson.version;

function displayAllFlags(program: Command): void {
  const lines: string[] = [];
  lines.push(chalk.bold.cyan('\nStreamPay CLI - All Available Flags\n'));
  lines.push(chalk.bold.yellow('GLOBAL FLAGS'));

  const globalOptions = program.options;
  globalOptions.forEach(opt => {
    lines.push(`  ${chalk.green(opt.flags.padEnd(25))} ${opt.description}`);
  });

  program.commands.forEach(cmd => {
    lines.push(chalk.bold.yellow(`\nCOMMAND: ${cmd.name()}`));

    if (cmd.commands && cmd.commands.length > 0) {
      cmd.commands.forEach(subcmd => {
        lines.push(chalk.cyan(`  ${subcmd.name()}`));
        subcmd.options.forEach(opt => {
          const defaultValue = opt.defaultValue !== undefined ? ` (default: "${opt.defaultValue}")` : '';
          lines.push(`    ${chalk.green(opt.flags.padEnd(25))} ${opt.description}${defaultValue}`);
        });
      });
    } else {
      cmd.options.forEach(opt => {
        const defaultValue = opt.defaultValue !== undefined ? ` (default: "${opt.defaultValue}")` : '';
        lines.push(`  ${chalk.green(opt.flags.padEnd(25))} ${opt.description}${defaultValue}`);
      });
    }
  });

  lines.push(chalk.gray("\nUse 'streampay <command> --help' for more information about a command.\n"));
  console.log(lines.join('\n'));
}

const program = new Command();

program
  .name('streampay')
  .description('StreamPay CLI - Manage your StreamPay resources from the command line')
  .version(version, '-v, --version', 'Display version number')
  .helpOption('-h, --help', 'Display help for commands')
  .option('--all-flags', 'Display all available flags')
  .option('--json', 'output in JSON format')
  .option('--table', 'output in table format')
  .option('--pretty', 'output in pretty format (default)')
  .addHelpCommand(false);

program.addCommand(createAuthCommands());
program.addCommand(createMeCommand());
program.addCommand(createConfigCommand());
program.addCommand(createConsumersCommands());
program.addCommand(createPaymentsCommands());
program.addCommand(createSubscriptionCommands());
program.addCommand(createInvoiceCommands());
program.addCommand(createProductCommands());
program.addCommand(createCouponsCommands());
program.addCommand(createCheckoutCommands());
program.addCommand(createWebhookCommands());

if (process.argv.includes('--all-flags')) {
  displayAllFlags(program);
  process.exit(0);
}

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
