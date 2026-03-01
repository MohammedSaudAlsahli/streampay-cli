import { Command } from 'commander';
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter, parseJson } from '../utils';

const VALID_LANGUAGES = ['AR', 'EN'];
const VALID_COMM_METHODS = ['WHATSAPP', 'EMAIL', 'SMS'];

export function createConsumersCommands(): Command {
  const consumers = new Command('consumers')
    .description('Manage consumers');

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------

  consumers
    .command('create')
    .description('Create a new consumer')
    .option('--name <name>', 'Consumer name (required unless --data is used)')
    .option('--phone-number <phone>', 'Consumer phone number')
    .option('--email <email>', 'Consumer email address')
    .option('--external-id <id>', 'External ID')
    .option('--iban <iban>', 'IBAN (max 34 chars)')
    .option('--alias <alias>', 'Alias')
    .option('--comment <comment>', 'Comment')
    .option('--preferred-language <lang>', 'Preferred language (AR | EN)')
    .option('--communication-methods <methods>', 'Comma-separated communication methods (WHATSAPP, EMAIL, SMS)')
    .option('--data <json>', 'Raw JSON body (overrides all flags)')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({ apiKey: ConfigManager.getApiKey(), ...config });

        let data: Record<string, any>;

        if (options.data) {
          data = parseJson(options.data);
        } else {
          if (!options.name) {
            throw new Error('--name is required when not using --data');
          }

          data = { name: options.name };

          if (options.phoneNumber) {
            data.phone_number = options.phoneNumber;
          }
          if (options.email) {
            data.email = options.email;
          }
          if (options.externalId) {
            data.external_id = options.externalId;
          }
          if (options.iban) {
            data.iban = options.iban;
          }
          if (options.alias) {
            data.alias = options.alias;
          }
          if (options.comment) {
            data.comment = options.comment;
          }
          if (options.preferredLanguage) {
            const lang = options.preferredLanguage.toUpperCase();
            if (!VALID_LANGUAGES.includes(lang)) {
              throw new Error(
                `Invalid preferred language "${options.preferredLanguage}". Must be one of: AR, EN`,
              );
            }
            data.preferred_language = lang;
          }
          if (options.communicationMethods) {
            const methods = options.communicationMethods
              .split(',')
              .map((m: string) => m.trim().toUpperCase());
            for (const m of methods) {
              if (!VALID_COMM_METHODS.includes(m)) {
                throw new Error(
                  `Invalid communication method "${m}". Must be one of: WHATSAPP, EMAIL, SMS`,
                );
              }
            }
            data.communication_methods = methods;
          }
        }

        const result = await client.createConsumer(data);
        OutputFormatter.success('Consumer created successfully');
        if (options.format === 'json') {
          OutputFormatter.output(result, { format: 'json' });
        } else if (options.format === 'table') {
          OutputFormatter.outputConsumerTable({ data: [result] });
        } else {
          OutputFormatter.outputConsumerDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to create consumer', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // get
  // ---------------------------------------------------------------------------

  consumers
    .command('get')
    .description('Get a consumer by ID')
    .argument('<id>', 'Consumer UUID')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({ apiKey: ConfigManager.getApiKey(), ...config });

        const result = await client.getConsumer(id);
        OutputFormatter.success('Consumer retrieved successfully');
        if (options.format === 'json') {
          OutputFormatter.output(result, { format: 'json' });
        } else if (options.format === 'table') {
          OutputFormatter.outputConsumerTable({ data: [result] });
        } else {
          OutputFormatter.outputConsumerDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to get consumer', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // list
  // ---------------------------------------------------------------------------

  consumers
    .command('list')
    .description('List all consumers')
    .option('--page <number>', 'Page number', parseInt)
    .option('--limit <number>', 'Results per page (max 100)', parseInt)
    .option('--search <term>', 'Search term')
    .option('--sort-field <field>', 'Field to sort by')
    .option('--sort-direction <direction>', 'Sort direction (asc|desc)')
    .option('--format <format>', 'Output format (json|table|pretty)', 'table')
    .action(async (options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({ apiKey: ConfigManager.getApiKey(), ...config });

        const params: Record<string, any> = {};
        if (options.page !== undefined) params.page = options.page;
        if (options.limit !== undefined) params.limit = options.limit;
        if (options.search) params.search_term = options.search;
        if (options.sortField) params.sort_field = options.sortField;
        if (options.sortDirection) params.sort_direction = options.sortDirection;

        const result = await client.getAllConsumers(params);
        if (options.format === 'json') {
          OutputFormatter.output(result, { format: 'json' });
        } else if (options.format === 'pretty') {
          OutputFormatter.outputPretty(result);
        } else {
          OutputFormatter.outputConsumerTable(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to list consumers', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------

  consumers
    .command('update')
    .description('Update a consumer by ID')
    .argument('<id>', 'Consumer UUID')
    .option('--name <name>', 'Consumer name')
    .option('--phone-number <phone>', 'Consumer phone number')
    .option('--email <email>', 'Consumer email address')
    .option('--external-id <id>', 'External ID')
    .option('--iban <iban>', 'IBAN (max 34 chars)')
    .option('--alias <alias>', 'Alias')
    .option('--comment <comment>', 'Comment')
    .option('--preferred-language <lang>', 'Preferred language (AR | EN)')
    .option('--communication-methods <methods>', 'Comma-separated communication methods (WHATSAPP, EMAIL, SMS)')
    .option('--data <json>', 'Raw JSON body (overrides all flags)')
    .option('--format <format>', 'Output format (json|table|pretty)', 'pretty')
    .action(async (id, options) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({ apiKey: ConfigManager.getApiKey(), ...config });

        let data: Record<string, any>;

        if (options.data) {
          data = parseJson(options.data);
        } else {
          data = {};

          if (options.name) {
            data.name = options.name;
          }
          if (options.phoneNumber) {
            data.phone_number = options.phoneNumber;
          }
          if (options.email) {
            data.email = options.email;
          }
          if (options.externalId) {
            data.external_id = options.externalId;
          }
          if (options.iban) {
            data.iban = options.iban;
          }
          if (options.alias) {
            data.alias = options.alias;
          }
          if (options.comment) {
            data.comment = options.comment;
          }
          if (options.preferredLanguage) {
            const lang = options.preferredLanguage.toUpperCase();
            if (!VALID_LANGUAGES.includes(lang)) {
              throw new Error(
                `Invalid preferred language "${options.preferredLanguage}". Must be one of: AR, EN`,
              );
            }
            data.preferred_language = lang;
          }
          if (options.communicationMethods) {
            const methods = options.communicationMethods
              .split(',')
              .map((m: string) => m.trim().toUpperCase());
            for (const m of methods) {
              if (!VALID_COMM_METHODS.includes(m)) {
                throw new Error(
                  `Invalid communication method "${m}". Must be one of: WHATSAPP, EMAIL, SMS`,
                );
              }
            }
            data.communication_methods = methods;
          }

          if (Object.keys(data).length === 0) {
            throw new Error('At least one field must be provided when not using --data');
          }
        }

        const result = await client.updateConsumer(id, data);
        OutputFormatter.success('Consumer updated successfully');
        if (options.format === 'json') {
          OutputFormatter.output(result, { format: 'json' });
        } else if (options.format === 'table') {
          OutputFormatter.outputConsumerTable({ data: [result] });
        } else {
          OutputFormatter.outputConsumerDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to update consumer', error);
        process.exit(1);
      }
    });

  // ---------------------------------------------------------------------------
  // delete
  // ---------------------------------------------------------------------------

  consumers
    .command('delete')
    .description('Delete a consumer by ID')
    .argument('<id>', 'Consumer UUID')
    .action(async (id) => {
      try {
        const config = ConfigManager.getConfig();
        const client = new StreamAppClient({ apiKey: ConfigManager.getApiKey(), ...config });

        await client.deleteConsumer(id);
        OutputFormatter.success('Consumer deleted successfully');
      } catch (error) {
        OutputFormatter.error('Failed to delete consumer', error);
        process.exit(1);
      }
    });

  return consumers;
}
