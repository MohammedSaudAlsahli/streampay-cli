import { Command } from 'commander';
import { createConfigSetCommand } from './set';
import { createConfigGetCommand } from './get';
import { createConfigClearCommand } from './clear';
import { createConfigPathCommand } from './path';

export function createConfigCommand(): Command {
  const config = new Command('config')
    .description('Manage CLI configuration');

  config.addCommand(createConfigSetCommand());
  config.addCommand(createConfigGetCommand());
  config.addCommand(createConfigClearCommand());
  config.addCommand(createConfigPathCommand());

  return config;
}
