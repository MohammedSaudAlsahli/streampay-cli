#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config();

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { createCheckoutCommands } from './commands/checkout';
import { createConfigCommand, createLoginCommand, createLogoutCommand } from './commands/config';
import { createMeCommand } from './commands/me';
import { createConsumersCommands } from './commands/consumers';
import { createCouponsCommands } from './commands/coupons';
import { createInvoiceCommands } from './commands/invoices';
import { createPaymentsCommands } from './commands/payments';
import { createProductCommands } from './commands/products';
import { createSubscriptionCommands } from './commands/subscriptions';
import { createWebhookCommands } from './commands/webhooks';

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
);
const version = packageJson.version;

const program = new Command();

program
  .name('streampay')
  .description('StreamPay CLI - Manage your StreamPay resources from the command line')
  .version(version, '-v, --version', 'Display version number').helpOption('-h, --help', 'Display help for commands').addHelpCommand(false);

program.addCommand(createLoginCommand());
program.addCommand(createLogoutCommand());
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

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
