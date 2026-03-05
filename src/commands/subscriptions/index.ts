import { Command } from 'commander';
import { createSubscriptionCreateCommand } from './create';
import { createSubscriptionGetCommand } from './get';
import { createSubscriptionListCommand } from './list';
import { createSubscriptionUpdateCommand } from './update';
import { createSubscriptionCancelCommand } from './cancel';
import { createSubscriptionFreezeCommand } from './freeze';
import { createSubscriptionFreezeListCommand } from './freeze-list';
import { createSubscriptionFreezeUpdateCommand } from './freeze-update';
import { createSubscriptionFreezeDeleteCommand } from './freeze-delete';

export function createSubscriptionCommands(): Command {
  const subscription = new Command('subs')
    .description('Manage subscriptions');

  subscription.addCommand(createSubscriptionCreateCommand());
  subscription.addCommand(createSubscriptionGetCommand());
  subscription.addCommand(createSubscriptionListCommand());
  subscription.addCommand(createSubscriptionUpdateCommand());
  subscription.addCommand(createSubscriptionCancelCommand());
  subscription.addCommand(createSubscriptionFreezeCommand());
  subscription.addCommand(createSubscriptionFreezeListCommand());
  subscription.addCommand(createSubscriptionFreezeUpdateCommand());
  subscription.addCommand(createSubscriptionFreezeDeleteCommand());

  return subscription;
}
