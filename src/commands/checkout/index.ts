import { Command } from 'commander';
import { createCheckoutCreateCommand } from './create';
import { createCheckoutGetCommand } from './get';
import { createCheckoutListCommand } from './list';
import { createCheckoutActivateCommand } from './activate';
import { createCheckoutDeactivateCommand } from './deactivate';
import { createCheckoutUpdateStatusCommand } from './update-status';

export function createCheckoutCommands(): Command {
  const checkout = new Command('checkout')
    .description('Manage payment links (checkout)');

  checkout.addCommand(createCheckoutCreateCommand());
  checkout.addCommand(createCheckoutGetCommand());
  checkout.addCommand(createCheckoutListCommand());
  checkout.addCommand(createCheckoutActivateCommand());
  checkout.addCommand(createCheckoutDeactivateCommand());
  checkout.addCommand(createCheckoutUpdateStatusCommand());

  return checkout;
}
