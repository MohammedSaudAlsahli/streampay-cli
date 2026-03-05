import { Command } from 'commander';
import { createEventsCommand } from './events';
import { createVerifyCommand } from './verify';

export function createWebhookCommands(): Command {
  const webhooks = new Command('webhook')
    .description('Webhook utilities and verification');

  webhooks.addCommand(createEventsCommand());
  webhooks.addCommand(createVerifyCommand());

  return webhooks;
}
