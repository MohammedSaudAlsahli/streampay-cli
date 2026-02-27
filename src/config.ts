import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  branch?: string;
  defaultFormat?: 'json' | 'table' | 'pretty';
}

export class ConfigManager {
  private static configPath = path.join(os.homedir(), '.streampay', 'config.json');

  static getConfigPath(): string {
    return this.configPath;
  }

  static getConfig(): Config {
    const config: Config = {};

    if (fs.existsSync(this.configPath)) {
      try {
        const fileConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
        Object.assign(config, fileConfig);
      } catch {
        // Silently ignore corrupt config file
      }
    }

    // Environment variables always win over file values
    if (process.env.STREAMPAY_API_KEY) {
      config.apiKey = process.env.STREAMPAY_API_KEY;
    }
    if (process.env.STREAMPAY_API_SECRET) {
      config.apiSecret = process.env.STREAMPAY_API_SECRET;
    }
    if (process.env.STREAMPAY_BASE_URL) {
      config.baseUrl = process.env.STREAMPAY_BASE_URL;
    }
    if (process.env.STREAMPAY_BRANCH) {
      config.branch = process.env.STREAMPAY_BRANCH;
    }

    return config;
  }

  static saveConfig(config: Partial<Config>): void {
    const configDir = path.dirname(this.configPath);

    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    let existing: Config = {};
    if (fs.existsSync(this.configPath)) {
      try {
        existing = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
      } catch {
        // Start fresh if the file is corrupt
      }
    }

    // Merge incoming values, then strip undefined keys so the file stays clean
    const merged = { ...existing, ...config };
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined) {
        clean[key] = value;
      }
    }

    fs.writeFileSync(this.configPath, JSON.stringify(clean, null, 2), 'utf-8');
  }

  static clearConfig(): void {
    if (fs.existsSync(this.configPath)) {
      fs.unlinkSync(this.configPath);
    }
  }

  static getApiKey(): string {
    const config = this.getConfig();
    if (!config.apiKey) {
      throw new Error(
        'API key not configured. Run one of:\n\n' +
        '  streampay login                              Set up credentials interactively\n' +
        '  streampay config set --api-key <key>         Set API key directly\n' +
        '  export STREAMPAY_API_KEY=<key>               Use environment variable',
      );
    }
    return config.apiKey;
  }

  static getApiSecret(): string | undefined {
    const config = this.getConfig();
    return config.apiSecret;
  }

  static isConfigured(): boolean {
    const config = this.getConfig();
    return !!config.apiKey;
  }
}
