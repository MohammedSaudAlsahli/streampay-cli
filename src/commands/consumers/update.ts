import { Command } from 'commander';
import { StreamAppClient } from '../../client';
import { ConfigManager } from '../../config';
import { OutputFormatter, parseJson, getMergedFormatOptions } from '../../utils';

const VALID_LANGUAGES = ['AR', 'EN'];
const VALID_COMM_METHODS = ['WHATSAPP', 'EMAIL', 'SMS'];

export function createConsumersUpdateCommand(): Command {
  const command = new Command('update')
    .description('Update a consumer (requires consumer ID)')
    .argument('<id>', 'Consumer UUID (required)')
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
    .option('--json', 'Output in JSON format')
    .option('--table', 'Output in table format')
    .option('--pretty', 'Output in pretty format (default)')
    .action(async function(this: Command, id, options) {
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
        const format = getMergedFormatOptions(options, this);
        if (format.json) {
          OutputFormatter.output(result, { json: true });
        } else if (format.table) {
          OutputFormatter.outputConsumerTable({ data: [result] });
        } else {
          OutputFormatter.outputConsumerDetail(result);
        }
      } catch (error) {
        OutputFormatter.error('Failed to update consumer', error);
        process.exit(1);
      }
    });

  return command;
}
