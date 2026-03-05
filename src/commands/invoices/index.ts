import { Command } from 'commander';
import { registerCreateCommand } from './create';
import { registerGetCommand } from './get';
import { registerListCommand } from './list';
import { registerUpdateCommand } from './update';
import { registerSendCommand } from './send';
import { registerAcceptCommand } from './accept';
import { registerRejectCommand } from './reject';
import { registerCompleteCommand } from './complete';
import { registerCancelCommand } from './cancel';

export function createInvoiceCommands(): Command {
  const invoice = new Command('invoices')
    .description('Manage invoices');

  registerCreateCommand(invoice);
  registerGetCommand(invoice);
  registerListCommand(invoice);
  registerUpdateCommand(invoice);
  registerSendCommand(invoice);
  registerAcceptCommand(invoice);
  registerRejectCommand(invoice);
  registerCompleteCommand(invoice);
  registerCancelCommand(invoice);

  return invoice;
}
