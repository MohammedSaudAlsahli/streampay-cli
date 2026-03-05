import { Command } from 'commander';
import { createLoginCommand } from './login';
import { createLogoutCommand } from './logout';
import { createStatusCommand } from './status';

export function createAuthCommands(): Command {
  const auth = new Command('auth')
    .description('Authentication commands');

  auth.addCommand(createLoginCommand());
  auth.addCommand(createLogoutCommand());
  auth.addCommand(createStatusCommand());

  return auth;
}
