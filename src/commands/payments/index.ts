import { Command } from 'commander';
import { createPaymentsGetCommand } from './get';
import { createPaymentsListCommand } from './list';
import { createPaymentsMarkPaidCommand } from './mark-paid';
import { createPaymentsRefundCommand } from './refund';
import { createPaymentsAutoChargeCommand } from './auto-charge';

export function createPaymentsCommands(): Command {
  const cmd = new Command('payments')
    .description('Manage payments');

  cmd.addCommand(createPaymentsGetCommand());
  cmd.addCommand(createPaymentsListCommand());
  cmd.addCommand(createPaymentsMarkPaidCommand());
  cmd.addCommand(createPaymentsRefundCommand());
  cmd.addCommand(createPaymentsAutoChargeCommand());

  return cmd;
}
