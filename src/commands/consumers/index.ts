import { Command } from 'commander';
import { createConsumersCreateCommand } from './create';
import { createConsumersGetCommand } from './get';
import { createConsumersListCommand } from './list';
import { createConsumersUpdateCommand } from './update';
import { createConsumersDeleteCommand } from './delete';

export function createConsumersCommands(): Command {
  const consumers = new Command('consumers')
    .description('Manage consumers');

  consumers.addCommand(createConsumersCreateCommand());
  consumers.addCommand(createConsumersGetCommand());
  consumers.addCommand(createConsumersListCommand());
  consumers.addCommand(createConsumersUpdateCommand());
  consumers.addCommand(createConsumersDeleteCommand());

  return consumers;
}
