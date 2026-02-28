import chalk from 'chalk';
import { table } from 'table';

export interface OutputOptions {
  format?: 'json' | 'table' | 'pretty';
  silent?: boolean;
}

interface StreamApiErrorBody {
  code?: string;
  message?: string;
  additional_info?: any;
}

interface PaginationInfo {
  // Real API fields
  current_page?: number;
  max_page?: number;
  total_count?: number;
  limit?: number;
  has_next_page?: boolean;
  has_previous_page?: boolean;
  // Legacy/fallback fields (keep for compatibility)
  page?: number;
  total_pages?: number;
  total?: number;
  [key: string]: any;
}

export class OutputFormatter {
  static output(data: any, options: OutputOptions = {}) {
    if (options.silent) {
      return;
    }

    const format = options.format || 'pretty';

    switch (format) {
      case 'json':
        console.log(JSON.stringify(data, null, 2));
        break;
      case 'table':
        this.outputTable(data);
        break;
      case 'pretty':
      default:
        this.outputPretty(data);
        break;
    }
  }

  static outputPretty(data: any) {
    // Unwrap paginated responses: { data: [...], pagination: {...} }
    const items = this.extractItems(data);
    const pagination = this.extractPagination(data);

    if (Array.isArray(items)) {
      console.log(chalk.green(`\nFound ${items.length} items:\n`));
      items.forEach((item, index) => {
        console.log(chalk.cyan(`[${index + 1}]`));
        this.printObject(item, 1);
        console.log();
      });
      if (pagination) {
        this.printPaginationInfo(pagination);
      }
    } else if (typeof items === 'object' && items !== null) {
      console.log(chalk.green('\nResult:\n'));
      this.printObject(items, 0);
      console.log();
    } else {
      console.log(data);
    }
  }

  static printObject(obj: any, indent: number = 0) {
    const spaces = '  '.repeat(indent);

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        console.log(`${spaces}${chalk.yellow(key)}: ${chalk.gray('—')}`);
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          console.log(`${spaces}${chalk.yellow(key)}: ${chalk.gray('[]')}`);
        } else if (typeof value[0] === 'object' && value[0] !== null) {
          console.log(`${spaces}${chalk.yellow(key)}: ${chalk.gray(`[${value.length} items]`)}`);
          value.forEach((item, index) => {
            console.log(`${spaces}  ${chalk.gray(`[${index}]`)}`);
            this.printObject(item, indent + 2);
          });
        } else {
          console.log(`${spaces}${chalk.yellow(key)}: ${chalk.white(value.join(', '))}`);
        }
      } else if (typeof value === 'object') {
        console.log(`${spaces}${chalk.yellow(key)}:`);
        this.printObject(value, indent + 1);
      } else if (typeof value === 'boolean') {
        console.log(`${spaces}${chalk.yellow(key)}: ${value ? chalk.green('true') : chalk.red('false')}`);
      } else {
        console.log(`${spaces}${chalk.yellow(key)}: ${chalk.white(String(value))}`);
      }
    }
  }

  static outputTable(data: any) {
    // Unwrap paginated responses
    const items = this.extractItems(data);
    const pagination = this.extractPagination(data);

    if (!Array.isArray(items) || items.length === 0) {
      console.log(chalk.yellow('No data to display in table format'));
      return;
    }

    // Collect all keys across every row for a consistent header
    const keySet = new Set<string>();
    for (const item of items) {
      if (typeof item === 'object' && item !== null) {
        for (const k of Object.keys(item)) {
          keySet.add(k);
        }
      }
    }
    const keys = Array.from(keySet);

    const headerRow = keys.map((k) => chalk.cyan.bold(k));
    const bodyRows = items.map((item) =>
      keys.map((k) => this.formatValue(item[k])),
    );

    console.log(table([headerRow, ...bodyRows]));

    if (pagination) {
      this.printPaginationInfo(pagination);
    }
  }

  static formatValue(value: any): string {
    if (value === null || value === undefined) {
      return chalk.gray('—');
    }
    if (typeof value === 'boolean') {
      return value ? chalk.green('✓') : chalk.red('✗');
    }
    if (Array.isArray(value)) {
      return chalk.gray(`[${value.length} items]`);
    }
    if (typeof value === 'object') {
      return chalk.gray('[Object]');
    }
    return String(value);
  }

  static success(message: string) {
    console.log(chalk.green('✓'), message);
  }

  static error(message: string, error?: any) {
    console.error(chalk.red('✗'), message);

    if (!error) {
      return;
    }

    // Case 1 – Axios interceptor shape: { status, message (raw response.data), error }
    // The interceptor sets `message` to the full response body which may contain
    // the StreamPay API error envelope: { error: { code, message, additional_info } }
    const apiBody = this.extractApiError(error);

    if (apiBody) {
      if (apiBody.code) {
        console.error(chalk.red('  Error:'), apiBody.code);
      }
      if (apiBody.message) {
        console.error(chalk.red('  Message:'), apiBody.message);
      }
      if (apiBody.additional_info) {
        const info = typeof apiBody.additional_info === 'string'
          ? apiBody.additional_info
          : JSON.stringify(apiBody.additional_info, null, 2);
        console.error(chalk.red('  Details:'), info);
      }
      const status = error.status || error.statusCode;
      if (status) {
        console.error(chalk.red('  Status:'), status);
      }
      return;
    }

    // Case 2 – Plain Error object (or subclass)
    if (error instanceof Error) {
      console.error(chalk.red('  Error:'), error.message);
      return;
    }

    // Case 3 – Object with message/status but no API envelope
    if (typeof error === 'object' && error !== null) {
      if (error.message) {
        const msg = typeof error.message === 'string'
          ? error.message
          : JSON.stringify(error.message, null, 2);
        console.error(chalk.red('  Error:'), msg);
      }
      if (error.status) {
        console.error(chalk.red('  Status:'), error.status);
      }
      return;
    }

    // Case 4 – String
    if (typeof error === 'string') {
      console.error(chalk.red('  Error:'), error);
      return;
    }

    // Case 5 – Unknown
    console.error(chalk.red('  Error:'), String(error));
  }

  static warning(message: string) {
    console.log(chalk.yellow('⚠'), message);
  }

  static info(message: string) {
    console.log(chalk.blue('ℹ'), message);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Try to locate the StreamPay API error body from various error shapes.
   *
   * Shapes handled:
   *  - Interceptor: `{ status, message: { error: { code, message, additional_info } } }`
   *  - Direct body: `{ error: { code, message, additional_info } }`
   *  - Flat:        `{ code, message, additional_info }`   (unlikely but defensive)
   */
  private static extractApiError(error: any): StreamApiErrorBody | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    // Interceptor stores response.data in `error.message`
    const body = error.message && typeof error.message === 'object'
      ? error.message
      : error;

    // { error: { code, message } }
    if (body.error && typeof body.error === 'object' && body.error.message) {
      return body.error as StreamApiErrorBody;
    }

    // Already flat API error shape { code, message }
    if (body.code && body.message && typeof body.message === 'string') {
      return body as StreamApiErrorBody;
    }

    return null;
  }

  /**
   * Extract the displayable item(s) from a response, unwrapping paginated
   * envelopes like `{ data: [...], pagination: {...} }`.
   */
  private static extractItems(data: any): any {
    if (
      data &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      Array.isArray(data.data)
    ) {
      return data.data;
    }
    return data;
  }

  /**
   * Extract pagination metadata if the response looks paginated.
   */
  private static extractPagination(data: any): PaginationInfo | null {
    if (
      data &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      data.pagination &&
      typeof data.pagination === 'object'
    ) {
      return data.pagination as PaginationInfo;
    }
    return null;
  }

  private static printPaginationInfo(pagination: PaginationInfo) {
    const parts: string[] = [];

    const currentPage = pagination.current_page ?? pagination.page;
    const maxPage = pagination.max_page ?? pagination.total_pages;
    const totalCount = pagination.total_count ?? pagination.total;

    if (currentPage !== undefined) {
      parts.push(`Page ${currentPage}`);
    }
    if (maxPage !== undefined) {
      parts.push(`of ${maxPage}`);
    }
    if (totalCount !== undefined) {
      parts.push(`(${totalCount} total)`);
    }
    if (pagination.limit !== undefined) {
      parts.push(`| ${pagination.limit} per page`);
    }
    if (pagination.has_next_page !== undefined || pagination.has_previous_page !== undefined) {
      const nav: string[] = [];
      if (pagination.has_previous_page) nav.push('← prev');
      if (pagination.has_next_page) nav.push('next →');
      if (nav.length > 0) parts.push(`[${nav.join(' ')}]`);
    }

    if (parts.length > 0) {
      console.log(chalk.gray(`  ${parts.join(' ')}`));
    }
  }
}

export function parseJson(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    const hint = jsonString.length > 80
      ? jsonString.slice(0, 80) + '…'
      : jsonString;
    throw new Error(
      `Invalid JSON input: ${err instanceof Error ? err.message : String(err)}\n  Input: ${hint}`,
    );
  }
}

export function parseFilters(filters: string[]): Record<string, any> {
  const result: Record<string, any> = {};

  for (const filter of filters) {
    const eqIndex = filter.indexOf('=');
    if (eqIndex === -1) {
      throw new Error(
        `Invalid filter "${filter}". Expected format: key=value`,
      );
    }

    const key = filter.slice(0, eqIndex);
    const raw = filter.slice(eqIndex + 1);

    if (!key) {
      throw new Error(
        `Invalid filter "${filter}". Key must not be empty.`,
      );
    }

    // Coerce well-known literal types
    if (raw === 'true') {
      result[key] = true;
    } else if (raw === 'false') {
      result[key] = false;
    } else if (raw === 'null') {
      result[key] = null;
    } else if (raw !== '' && !isNaN(Number(raw))) {
      result[key] = Number(raw);
    } else {
      result[key] = raw;
    }
  }

  return result;
}
