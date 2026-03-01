import chalk from 'chalk';
import Table from 'cli-table3';

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

    // Generic mode: skip keys whose values are always nested objects (unreadable in table)
    const keySet = new Set<string>();
    for (const item of items) {
      if (typeof item === 'object' && item !== null) {
        for (const k of Object.keys(item)) {
          const v = item[k];
          if (v !== null && typeof v === 'object' && !Array.isArray(v)) continue;
          keySet.add(k);
        }
      }
    }
    const keys = Array.from(keySet);

    // Build cli-table3 instance with cyan bold headers
    const t = new Table({
      head: keys.map((k) => chalk.cyan.bold(k)),
      style: {
        head: [],    // colors applied manually above
        border: ['gray'],
      },
      wordWrap: true,
    });

    // Add rows with meaningful colors per value type/semantic
    for (const item of items) {
      const row = keys.map((k) => this.formatValueColored(item[k], k));
      t.push(row);
    }

    console.log(t.toString());

    if (pagination) {
      this.printPaginationInfo(pagination);
    }
  }

  /**
   * Render a curated, readable table for invoice list results.
   * Only shows the most useful columns; nested objects are flattened to key fields.
   */
  static outputInvoiceTable(data: any) {
    const items = this.extractItems(data);
    const pagination = this.extractPagination(data);

    if (!Array.isArray(items) || items.length === 0) {
      console.log(chalk.yellow('No invoices found'));
      return;
    }

    const columns: { label: string; format: (item: any) => string }[] = [
      {
        label: '#',
        format: (item) => chalk.white.dim(String(item.org_invoice_number ?? item.invoice_number ?? '—')),
      },
      {
        label: 'ID',
        format: (item) => chalk.white.dim(item.id ?? '—'),
      },
      {
        label: 'Consumer',
        format: (item) => {
          const c = item.organization_consumer;
          if (!c) return chalk.gray('—');
          return chalk.white.bold(c.name || c.alias || c.email || (c.id ? c.id.slice(0, 8) : '—'));
        },
      },
      {
        label: 'Status',
        format: (item) => this.formatValueColored(item.status, 'status'),
      },
      {
        label: 'Total',
        format: (item) => {
          const amt = item.total_amount;
          const cur = item.currency || 'SAR';
          if (amt == null) return chalk.gray('—');
          return chalk.magenta(`${amt} ${cur}`);
        },
      },
      {
        label: 'Paid',
        format: (item) => {
          const amt = item.paid_amount;
          const cur = item.currency || 'SAR';
          if (amt == null) return chalk.gray('—');
          return chalk.green(`${amt} ${cur}`);
        },
      },
      {
        label: 'Remaining',
        format: (item) => {
          const amt = item.remaining_amount;
          const cur = item.currency || 'SAR';
          if (amt == null) return chalk.gray('—');
          const num = parseFloat(amt);
          return num > 0 ? chalk.red(`${amt} ${cur}`) : chalk.green(`${amt} ${cur}`);
        },
      },
      {
        label: 'Due Date',
        format: (item) => {
          const payments: any[] = item.payments || [];
          const scheduled = payments.length > 0 ? payments[0].scheduled_on : null;
          if (!scheduled) return chalk.gray('—');
          return chalk.blue(scheduled.slice(0, 10));
        },
      },
      {
        label: 'Payments',
        format: (item) => {
          const total = item.total_number_of_payments;
          if (total == null) return chalk.gray('—');
          return chalk.white(String(total));
        },
      },
      {
        label: 'Created',
        format: (item) => {
          if (!item.created_at) return chalk.gray('—');
          return item.created_at.slice(0, 10);
        },
      },
    ];

    const t = new Table({
      head: columns.map((c) => chalk.cyan.bold(c.label)),
      style: {
        head: [],
        border: ['gray'],
      },
      wordWrap: true,
    });

    for (const item of items) {
      t.push(columns.map((c) => c.format(item)));
    }

    console.log(t.toString());

    if (pagination) {
      this.printPaginationInfo(pagination);
    }
  }

  /**
   * Render a clean, human-readable summary of a single invoice.
   * Used by get, create, update, send, accept, reject, complete, cancel.
   */
  static outputInvoiceDetail(data: any) {
    const inv = data;
    if (!inv || typeof inv !== 'object') {
      console.log(data);
      return;
    }

    const line = (label: string, value: string) =>
      console.log(`  ${chalk.yellow(label.padEnd(22))} ${value}`);

    const sep = () => console.log(chalk.gray('  ' + '─'.repeat(52)));

    console.log();

    // ── Header ──────────────────────────────────────────────
    const statusColor = this.formatValueColored(inv.status, 'status');
    console.log(
      chalk.cyan.bold(`  Invoice #${inv.org_invoice_number ?? inv.invoice_number ?? '—'}`) +
      chalk.gray('  ') + statusColor +
      (inv.type ? chalk.gray(`  [${inv.type}]`) : '')
    );
    console.log(chalk.gray(`  ${inv.id ?? '—'}`));
    sep();

    // ── Consumer ────────────────────────────────────────────
    const c = inv.organization_consumer;
    if (c) {
      line('Consumer', chalk.white.bold(c.name || c.alias || '—'));
      if (c.email) line('Email', chalk.cyan(c.email));
      if (c.phone_number) line('Phone', chalk.cyan(c.phone_number));
    }
    sep();

    // ── Amounts ─────────────────────────────────────────────
    const cur = inv.currency || 'SAR';
    line('Currency', chalk.yellow(cur));
    line('Total', chalk.magenta(`${inv.total_amount ?? '—'} ${cur}`));
    if (inv.total_vat_amount && parseFloat(inv.total_vat_amount) > 0) {
      line('VAT', chalk.white(`${inv.total_vat_amount} ${cur}`));
    }
    line('Paid', chalk.green(`${inv.paid_amount ?? '—'} ${cur}`));
    const remaining = inv.remaining_amount;
    if (remaining != null) {
      const remNum = parseFloat(remaining);
      line('Remaining', remNum > 0 ? chalk.red(`${remaining} ${cur}`) : chalk.green(`${remaining} ${cur}`));
    }
    sep();

    // ── Payments ────────────────────────────────────────────
    const payments: any[] = inv.payments || [];
    if (payments.length > 0) {
      console.log(`  ${chalk.yellow('Payments')} ${chalk.gray(`(${payments.length})`)}`);
      for (const p of payments) {
        const pStatus = this.formatValueColored(p.current_status, 'status');
        const pDate = p.scheduled_on ? p.scheduled_on.slice(0, 10) : '—';
        const pPaid = p.payed_at ? chalk.gray(` · paid ${p.payed_at.slice(0, 10)}`) : '';
        console.log(
          `    ${chalk.gray(`[${p.invoice_payment_number}]`)} ` +
          chalk.magenta(`${p.amount} ${p.currency ?? cur}`) +
          `  ${pStatus}` +
          `  ${chalk.blue(pDate)}` +
          pPaid
        );
      }
      sep();
    }

    // ── Items ───────────────────────────────────────────────
    const items: any[] = inv.items || [];
    if (items.length > 0) {
      console.log(`  ${chalk.yellow('Items')} ${chalk.gray(`(${items.length})`)}`);
      for (const it of items) {
        const prod = it.product;
        const name = prod?.name || it.product_id?.slice(0, 8) || '—';
        console.log(
          `    ${chalk.white.bold(name)}` +
          chalk.gray(`  ×${it.quantity}`) +
          `  ${chalk.magenta(`${it.discounted_amount ?? it.original_amount ?? '—'} ${it.currency ?? cur}`)}`
        );
      }
      sep();
    }

    // ── Payment Methods ─────────────────────────────────────
    const pm = inv.payment_methods;
    if (pm) {
      const enabled = Object.entries(pm)
        .filter(([, v]) => v === true)
        .map(([k]) => k)
        .join(', ');
      line('Payment Methods', chalk.white(enabled || '—'));
    }

    // ── Dates ───────────────────────────────────────────────
    if (inv.created_at) line('Created', chalk.blue(inv.created_at.slice(0, 19).replace('T', ' ')));
    if (inv.updated_at) line('Updated', chalk.blue(inv.updated_at.slice(0, 19).replace('T', ' ')));

    // ── Description ─────────────────────────────────────────
    if (inv.description) {
      sep();
      line('Description', chalk.white(inv.description));
    }

    // ── URL ─────────────────────────────────────────────────
    if (inv.url) {
      sep();
      line('URL', chalk.blue.underline(inv.url));
    }

    // ── Branch ──────────────────────────────────────────────
    const branch = inv.branch;
    if (branch?.name) {
      line('Branch', chalk.white(branch.name));
    }

    console.log();
  }

  /**
   * Render a curated, readable table for payment link (checkout) list results.
   */
  static outputCheckoutTable(data: any) {
    const items = this.extractItems(data);
    const pagination = this.extractPagination(data);

    if (!Array.isArray(items) || items.length === 0) {
      console.log(chalk.yellow('No payment links found'));
      return;
    }

    const columns: { label: string; format: (item: any) => string }[] = [
      {
        label: 'ID',
        format: (item) => chalk.white.dim(item.id ?? '—'),
      },
      {
        label: 'Name',
        format: (item) => chalk.white.bold(item.name || '—'),
      },
      {
        label: 'Status',
        format: (item) => this.formatValueColored(item.status, 'status'),
      },
      {
        label: 'Amount',
        format: (item) => {
          const amt = item.amount;
          const cur = item.currency || 'SAR';
          if (amt == null) return chalk.gray('—');
          return chalk.magenta(`${amt} ${cur}`);
        },
      },
      {
        label: 'Collected',
        format: (item) => {
          const amt = item.amount_collected;
          const cur = item.currency || 'SAR';
          if (amt == null) return chalk.gray('—');
          return chalk.green(`${amt} ${cur}`);
        },
      },
      {
        label: 'Items',
        format: (item) => {
          const its: any[] = item.items || [];
          if (its.length === 0) return chalk.gray('—');
          return chalk.white(its.map((i: any) => {
            const name = i.product?.name || i.product_id?.slice(0, 8) || '?';
            return `${name} ×${i.quantity}`;
          }).join(', '));
        },
      },
      {
        label: 'Max Payments',
        format: (item) => item.max_number_of_payments != null
          ? chalk.white(String(item.max_number_of_payments))
          : chalk.gray('∞'),
      },
      {
        label: 'Valid Until',
        format: (item) => item.valid_until
          ? chalk.blue(item.valid_until.slice(0, 10))
          : chalk.gray('—'),
      },
      {
        label: 'URL',
        format: (item) => item.url
          ? chalk.blue.underline(item.url)
          : chalk.gray('—'),
      },
      {
        label: 'Created',
        format: (item) => item.created_at
          ? chalk.blue(item.created_at.slice(0, 10))
          : chalk.gray('—'),
      },
    ];

    const t = new Table({
      head: columns.map((c) => chalk.cyan.bold(c.label)),
      style: { head: [], border: ['gray'] },
      wordWrap: true,
    });

    for (const item of items) {
      t.push(columns.map((c) => c.format(item)));
    }

    console.log(t.toString());

    if (pagination) {
      this.printPaginationInfo(pagination);
    }
  }

  /**
   * Render a clean, human-readable summary of a single payment link.
   * Used by checkout get, create, activate, deactivate, update-status.
   */
  static outputCheckoutDetail(data: any) {
    const pl = data;
    if (!pl || typeof pl !== 'object') {
      console.log(data);
      return;
    }

    const line = (label: string, value: string) =>
      console.log(`  ${chalk.yellow(label.padEnd(22))} ${value}`);

    const sep = () => console.log(chalk.gray('  ' + '─'.repeat(52)));

    console.log();

    // ── Header ──────────────────────────────────────────────
    const statusColor = this.formatValueColored(pl.status, 'status');
    console.log(
      chalk.cyan.bold(`  ${pl.name || 'Payment Link'}`) +
      chalk.gray('  ') + statusColor
    );
    console.log(chalk.gray(`  ${pl.id ?? '—'}`));
    sep();

    // ── Amounts ─────────────────────────────────────────────
    const cur = pl.currency || 'SAR';
    line('Currency', chalk.yellow(cur));
    line('Amount', chalk.magenta(`${pl.amount ?? '—'} ${cur}`));
    if (pl.amount_collected != null) {
      line('Collected', chalk.green(`${pl.amount_collected} ${cur}`));
    }
    sep();

    // ── Items ───────────────────────────────────────────────
    const items: any[] = pl.items || [];
    if (items.length > 0) {
      console.log(`  ${chalk.yellow('Items')} ${chalk.gray(`(${items.length})`)}`);
      for (const it of items) {
        const name = it.product?.name || it.product_id?.slice(0, 8) || '—';
        const price = it.discounted_amount ?? it.original_amount ?? '—';
        console.log(
          `    ${chalk.white.bold(name)}` +
          chalk.gray(`  ×${it.quantity}`) +
          `  ${chalk.magenta(`${price} ${it.currency ?? cur}`)}`
        );
      }
      sep();
    }

    // ── Settings ────────────────────────────────────────────
    if (pl.max_number_of_payments != null) {
      line('Max Payments', chalk.white(String(pl.max_number_of_payments)));
    } else {
      line('Max Payments', chalk.gray('∞ unlimited'));
    }
    if (pl.valid_until) {
      line('Valid Until', chalk.blue(pl.valid_until.slice(0, 19).replace('T', ' ')));
    }
    if (pl.contact_information_type) {
      line('Contact Type', chalk.white(pl.contact_information_type));
    }

    // ── Payment Methods ─────────────────────────────────────
    const pm = pl.override_payment_methods;
    if (pm) {
      const enabled = Object.entries(pm)
        .filter(([, v]) => v === true)
        .map(([k]) => k)
        .join(', ');
      if (enabled) line('Payment Methods', chalk.white(enabled));
    }

    // ── Redirects ───────────────────────────────────────────
    if (pl.success_redirect_url) {
      line('Success URL', chalk.blue.underline(pl.success_redirect_url));
    }
    if (pl.failure_redirect_url) {
      line('Failure URL', chalk.blue.underline(pl.failure_redirect_url));
    }

    // ── Dates ───────────────────────────────────────────────
    if (pl.created_at) line('Created', chalk.blue(pl.created_at.slice(0, 19).replace('T', ' ')));
    if (pl.updated_at) line('Updated', chalk.blue(pl.updated_at.slice(0, 19).replace('T', ' ')));

    // ── Description ─────────────────────────────────────────
    if (pl.description) {
      sep();
      line('Description', chalk.white(pl.description));
    }

    // ── Messages ────────────────────────────────────────────
    if (pl.confirmation_message) {
      line('Confirmation Msg', chalk.white(pl.confirmation_message));
    }
    if (pl.deactivate_message) {
      line('Deactivate Msg', chalk.white(pl.deactivate_message));
    }

    // ── URL ─────────────────────────────────────────────────
    if (pl.url) {
      sep();
      line('URL', chalk.blue.underline(pl.url));
    }

    console.log();
  }

  /**
   * Render a curated, readable table for product list results.
   * Only shows the most useful columns; no raw UUIDs, deprecated fields, or nested objects.
   */
  static outputProductTable(data: any) {
    const items = this.extractItems(data);
    const pagination = this.extractPagination(data);

    if (!Array.isArray(items) || items.length === 0) {
      console.log(chalk.yellow('No products found'));
      return;
    }

    const columns: { label: string; format: (item: any) => string }[] = [
      {
        label: 'Name',
        format: (item) => chalk.white.bold(item.name || '—'),
      },
      {
        label: 'Type',
        format: (item) => item.type === 'RECURRING'
          ? chalk.cyan('RECURRING')
          : chalk.white('ONE_OFF'),
      },
      {
        label: 'Interval',
        format: (item) => {
          if (!item.recurring_interval) return chalk.gray('—');
          const count = item.recurring_interval_count ?? 1;
          return chalk.cyan(`Every ${count} ${item.recurring_interval}`);
        },
      },
      {
        label: 'Price',
        format: (item) => {
          const prices: any[] = item.prices || [];
          const activePrices = prices.filter((p: any) => p.is_active !== false);
          if (activePrices.length > 0) {
            return chalk.magenta(
              activePrices.map((p: any) => `${p.amount} ${p.currency}`).join(' / ')
            );
          }
          // Fallback to legacy fields
          if (item.price && item.currency) {
            return chalk.magenta(`${item.price} ${item.currency}`);
          }
          return chalk.gray('—');
        },
      },
      {
        label: 'VAT',
        format: (item) => {
          const prices: any[] = item.prices || [];
          const p = prices[0];
          if (p) {
            if (p.is_price_exempt_from_vat) return chalk.gray('Exempt');
            if (p.is_price_inclusive_of_vat) return chalk.gray('Incl.');
            return chalk.gray('Excl.');
          }
          if (item.is_price_exempt_from_vat) return chalk.gray('Exempt');
          if (item.is_price_inclusive_of_vat) return chalk.gray('Incl.');
          return chalk.gray('Excl.');
        },
      },
      {
        label: 'Status',
        format: (item) => item.is_active
          ? chalk.green('● Active')
          : chalk.red('○ Inactive'),
      },
      {
        label: 'Created',
        format: (item) => item.created_at
          ? chalk.blue(item.created_at.slice(0, 10))
          : chalk.gray('—'),
      },
    ];

    const t = new Table({
      head: columns.map((c) => chalk.cyan.bold(c.label)),
      style: { head: [], border: ['gray'] },
      wordWrap: true,
    });

    for (const item of items) {
      t.push(columns.map((c) => c.format(item)));
    }

    console.log(t.toString());

    if (pagination) {
      this.printPaginationInfo(pagination);
    }
  }

  /**
   * Render a clean, human-readable summary of a single product.
   * Used by products get, create, update.
   */
  static outputProductDetail(data: any) {
    const prod = data;
    if (!prod || typeof prod !== 'object') {
      console.log(data);
      return;
    }

    const line = (label: string, value: string) =>
      console.log(`  ${chalk.yellow(label.padEnd(18))} ${value}`);

    const sep = () => console.log(chalk.gray('  ' + '─'.repeat(52)));

    console.log();

    // ── Header ──────────────────────────────────────────────
    const statusBadge = prod.is_active
      ? chalk.green('● Active')
      : chalk.red('○ Inactive');
    const typeBadge = prod.type === 'RECURRING'
      ? chalk.cyan('[RECURRING]')
      : chalk.white('[ONE_OFF]');
    console.log(
      chalk.white.bold(`  ${prod.name || '—'}`) +
      chalk.gray('  ') + statusBadge +
      chalk.gray('  ') + typeBadge
    );
    console.log(chalk.gray(`  ${prod.id ?? '—'}`));
    sep();

    // ── Details ─────────────────────────────────────────────
    line('Type', prod.type === 'RECURRING' ? chalk.cyan('RECURRING') : chalk.white('ONE_OFF'));

    if (prod.recurring_interval) {
      const count = prod.recurring_interval_count ?? 1;
      line('Interval', chalk.cyan(`Every ${count} ${prod.recurring_interval}`));
    }

    line('One-time', prod.is_one_time ? chalk.yellow('Yes') : chalk.gray('No'));

    if (prod.description) {
      line('Description', chalk.white(prod.description));
    }

    sep();

    // ── Prices ──────────────────────────────────────────────
    const prices: any[] = prod.prices || [];
    if (prices.length > 0) {
      console.log(`  ${chalk.yellow('Prices')} ${chalk.gray(`(${prices.length})`)}`);
      for (const p of prices) {
        const activeTag = p.is_active === false ? chalk.red(' [inactive]') : '';
        let vatTag = '';
        if (p.is_price_exempt_from_vat) {
          vatTag = chalk.gray('  Exempt from VAT');
        } else if (p.is_price_inclusive_of_vat) {
          vatTag = chalk.gray('  Incl. VAT') + (p.vat_amount ? chalk.gray(` (VAT: ${p.vat_amount})`) : '');
        } else {
          vatTag = chalk.gray('  Excl. VAT');
        }
        console.log(
          `    ${chalk.yellow(p.currency.padEnd(5))} ` +
          chalk.magenta(String(p.amount).padStart(10)) +
          vatTag +
          activeTag
        );
      }
    } else if (prod.price && prod.currency) {
      // Legacy fallback
      console.log(`  ${chalk.yellow('Price')} ${chalk.magenta(`${prod.price} ${prod.currency}`)}`);
      if (prod.vat_amount && parseFloat(prod.vat_amount) > 0) {
        console.log(`  ${chalk.yellow('VAT')}   ${chalk.gray(prod.vat_amount)}`);
      }
    }

    sep();

    // ── Dates ───────────────────────────────────────────────
    if (prod.created_at) line('Created', chalk.blue(prod.created_at.slice(0, 10)));
    if (prod.updated_at) line('Updated', chalk.blue(prod.updated_at.slice(0, 10)));

    console.log();
  }

  /**
   * Render a curated, readable table for consumer list results.
   * Only shows the most useful columns.
   */
  static outputConsumerTable(data: any) {
    const items = this.extractItems(data);
    const pagination = this.extractPagination(data);

    if (!Array.isArray(items) || items.length === 0) {
      console.log(chalk.yellow('No consumers found'));
      return;
    }

    const columns: { label: string; format: (item: any) => string }[] = [
      { label: 'Name', format: (item) => chalk.white.bold(item.name || '—') },
      { label: 'Alias', format: (item) => item.alias ? chalk.white(item.alias) : chalk.gray('—') },
      { label: 'Email', format: (item) => item.email ? chalk.cyan(item.email) : chalk.gray('—') },
      { label: 'Phone', format: (item) => item.phone_number ? chalk.cyan(item.phone_number) : chalk.gray('—') },
      { label: 'Language', format: (item) => item.preferred_language ? chalk.yellow(item.preferred_language) : chalk.gray('—') },
      {
        label: 'Comms',
        format: (item) => {
          const methods: string[] = item.communication_methods || [];
          return methods.length > 0 ? chalk.white(methods.join(', ')) : chalk.gray('—');
        },
      },
      { label: 'Created', format: (item) => item.created_at ? chalk.blue(item.created_at.slice(0, 10)) : chalk.gray('—') },
    ];

    const t = new Table({
      head: columns.map((c) => chalk.cyan.bold(c.label)),
      style: { head: [], border: ['gray'] },
      wordWrap: true,
    });

    for (const item of items) {
      t.push(columns.map((c) => c.format(item)));
    }

    console.log(t.toString());

    if (pagination) {
      this.printPaginationInfo(pagination);
    }
  }

  /**
   * Render a detailed single-consumer view.
   */
  static outputConsumerDetail(data: any) {
    const c = data;
    if (!c || typeof c !== 'object') { console.log(data); return; }

    const line = (label: string, value: string) =>
      console.log(`  ${chalk.yellow(label.padEnd(22))} ${value}`);
    const sep = () => console.log(chalk.gray('  ' + '─'.repeat(52)));

    console.log();

    // Header
    console.log(chalk.white.bold(`  ${c.name || '—'}`));
    console.log(chalk.gray(`  ${c.id ?? '—'}`));
    sep();

    // Contact
    if (c.email) line('Email', chalk.cyan(c.email));
    if (c.phone_number) line('Phone', chalk.cyan(c.phone_number));
    if (c.alias) line('Alias', chalk.white(c.alias));
    if (c.preferred_language) line('Language', chalk.yellow(c.preferred_language));

    const methods: string[] = c.communication_methods || [];
    if (methods.length > 0) line('Comms', chalk.white(methods.join(', ')));

    sep();

    // Extra
    if (c.external_id) line('External ID', chalk.white.dim(c.external_id));
    if (c.iban) line('IBAN', chalk.white.dim(c.iban));
    if (c.comment) line('Comment', chalk.white(c.comment));

    sep();

    // Dates
    if (c.created_at) line('Created', chalk.blue(c.created_at.slice(0, 10)));
    if (c.updated_at) line('Updated', chalk.blue(c.updated_at.slice(0, 10)));

    console.log();
  }

  /**
   * Render a curated, readable table for subscription list results.
   * Only shows the most useful columns; no raw UUIDs or nested objects.
   */
  static outputSubscriptionTable(data: any) {
    const items = this.extractItems(data);
    const pagination = this.extractPagination(data);

    if (!Array.isArray(items) || items.length === 0) {
      console.log(chalk.yellow('No subscriptions found'));
      return;
    }

    const columns: { label: string; format: (item: any) => string }[] = [
      {
        label: 'Consumer',
        format: (item) => {
          const c = item.organization_consumer;
          if (!c) return chalk.gray('—');
          return chalk.white.bold(c.name || c.alias || c.email || c.id?.slice(0, 8) || '—');
        },
      },
      {
        label: 'Status',
        format: (item) => this.formatValueColored(item.status, 'status'),
      },
      {
        label: 'Amount',
        format: (item) => item.amount
          ? chalk.magenta(`${item.amount} ${item.currency || 'SAR'}`)
          : chalk.gray('—'),
      },
      {
        label: 'Interval',
        format: (item) => item.recurring_interval
          ? chalk.cyan(`Every ${item.recurring_interval_count ?? 1} ${item.recurring_interval}`)
          : chalk.gray('—'),
      },
      {
        label: 'Cycle #',
        format: (item) => item.current_cycle_number != null
          ? chalk.white(String(item.current_cycle_number))
          : chalk.gray('—'),
      },
      {
        label: 'Period End',
        format: (item) => item.current_period_end
          ? chalk.blue(item.current_period_end.slice(0, 10))
          : chalk.gray('—'),
      },
      {
        label: 'Created',
        format: (item) => item.created_at
          ? chalk.blue(item.created_at.slice(0, 10))
          : chalk.gray('—'),
      },
    ];

    const t = new Table({
      head: columns.map((c) => chalk.cyan.bold(c.label)),
      style: { head: [], border: ['gray'] },
      wordWrap: true,
    });

    for (const item of items) {
      t.push(columns.map((c) => c.format(item)));
    }

    console.log(t.toString());

    if (pagination) {
      this.printPaginationInfo(pagination);
    }
  }

  /**
   * Render a clean, human-readable summary of a single subscription.
   * Used by subs get, create, update, cancel.
   */
  static outputSubscriptionDetail(data: any) {
    const sub = data;
    if (!sub || typeof sub !== 'object') { console.log(data); return; }

    const line = (label: string, value: string) =>
      console.log(`  ${chalk.yellow(label.padEnd(22))} ${value}`);
    const sep = () => console.log(chalk.gray('  ' + '─'.repeat(52)));

    console.log();

    // ── Header ──────────────────────────────────────────────
    const statusBadge = this.formatValueColored(sub.status, 'status');
    console.log(
      chalk.white.bold(`  Subscription`) +
      chalk.gray('  ') + statusBadge
    );
    console.log(chalk.gray(`  ${sub.id ?? '—'}`));
    sep();

    // ── Consumer ────────────────────────────────────────────
    const c = sub.organization_consumer;
    if (c) {
      line('Consumer', chalk.white.bold(c.name || c.alias || '—'));
      if (c.email) line('Email', chalk.cyan(c.email));
    }
    sep();

    // ── Billing ─────────────────────────────────────────────
    line('Amount', chalk.magenta(`${sub.amount ?? '—'} ${sub.currency || 'SAR'}`));
    if (sub.original_amount && sub.original_amount !== sub.amount) {
      line('Original Amount', chalk.gray(`${sub.original_amount} ${sub.currency || 'SAR'}`));
    }
    if (sub.recurring_interval) {
      line('Interval', chalk.cyan(`Every ${sub.recurring_interval_count ?? 1} ${sub.recurring_interval}`));
    }
    line('Cycle #', chalk.white(String(sub.current_cycle_number ?? '—')));
    if (sub.cancel_at_cycle_number) {
      line('Cancels at Cycle', chalk.yellow(String(sub.cancel_at_cycle_number)));
    }
    line('Cancel at Period End', sub.cancel_at_period_end ? chalk.yellow('Yes') : chalk.gray('No'));
    sep();

    // ── Period ───────────────────────────────────────────────
    if (sub.current_period_start) line('Period Start', chalk.blue(sub.current_period_start.slice(0, 10)));
    if (sub.current_period_end) line('Period End', chalk.blue(sub.current_period_end.slice(0, 10)));
    if (sub.started_at) line('Started', chalk.blue(sub.started_at.slice(0, 10)));
    if (sub.ended_at) line('Ended', chalk.red(sub.ended_at.slice(0, 10)));
    sep();

    // ── Items ───────────────────────────────────────────────
    const items: any[] = sub.items || [];
    if (items.length > 0) {
      console.log(`  ${chalk.yellow('Items')} ${chalk.gray(`(${items.length})`)}`);
      for (const it of items) {
        const name = it.product?.name || it.product_id?.slice(0, 8) || '—';
        console.log(
          `    ${chalk.white.bold(name)}` +
          chalk.gray(`  ×${it.quantity}`) +
          `  ${chalk.magenta(`${it.discounted_amount ?? it.original_amount ?? '—'} ${sub.currency || 'SAR'}`)}`
        );
      }
      sep();
    }

    // ── Active freeze ────────────────────────────────────────
    const freeze = sub.latest_freeze;
    if (freeze) {
      console.log(`  ${chalk.yellow('Active Freeze')}`);
      console.log(`    ${chalk.gray('Start:')} ${chalk.blue(freeze.freeze_start_datetime?.slice(0, 10) ?? '—')}`);
      console.log(`    ${chalk.gray('End:')}   ${freeze.freeze_end_datetime ? chalk.blue(freeze.freeze_end_datetime.slice(0, 10)) : chalk.gray('indefinite')}`);
      if (freeze.notes) console.log(`    ${chalk.gray('Notes:')} ${chalk.white(freeze.notes)}`);
      sep();
    }

    // ── Description ──────────────────────────────────────────
    if (sub.description) {
      line('Description', chalk.white(sub.description));
      sep();
    }

    // ── Dates ───────────────────────────────────────────────
    if (sub.created_at) line('Created', chalk.blue(sub.created_at.slice(0, 10)));
    if (sub.updated_at) line('Updated', chalk.blue(sub.updated_at.slice(0, 10)));

    console.log();
  }

  /**
   * Render a curated, readable table for subscription freeze period list results.
   */
  static outputFreezeTable(data: any) {
    const items = this.extractItems(data);
    const pagination = this.extractPagination(data);

    if (!Array.isArray(items) || items.length === 0) {
      console.log(chalk.yellow('No freeze periods found'));
      return;
    }

    const columns: { label: string; format: (item: any) => string }[] = [
      {
        label: 'Start',
        format: (item) => item.freeze_start_datetime
          ? chalk.blue(item.freeze_start_datetime.slice(0, 10))
          : chalk.gray('—'),
      },
      {
        label: 'End',
        format: (item) => item.freeze_end_datetime
          ? chalk.blue(item.freeze_end_datetime.slice(0, 10))
          : chalk.gray('indefinite'),
      },
      {
        label: 'Duration',
        format: (item) => item.duration != null
          ? chalk.white(`${item.duration} days`)
          : chalk.gray('—'),
      },
      {
        label: 'Notes',
        format: (item) => item.notes ? chalk.white(item.notes) : chalk.gray('—'),
      },
      {
        label: 'Created',
        format: (item) => item.created_at
          ? chalk.blue(item.created_at.slice(0, 10))
          : chalk.gray('—'),
      },
    ];

    const t = new Table({
      head: columns.map((c) => chalk.cyan.bold(c.label)),
      style: { head: [], border: ['gray'] },
      wordWrap: true,
    });

    for (const item of items) {
      t.push(columns.map((c) => c.format(item)));
    }

    console.log(t.toString());

    if (pagination) {
      this.printPaginationInfo(pagination);
    }
  }

  /**
   * Render a curated, readable table for coupon list results.
   */
  static outputCouponTable(data: any) {
    const items = this.extractItems(data);
    const pagination = this.extractPagination(data);

    if (!Array.isArray(items) || items.length === 0) {
      console.log(chalk.yellow('No coupons found'));
      return;
    }

    const columns: { label: string; format: (item: any) => string }[] = [
      { label: 'Name', format: (item) => chalk.white.bold(item.name || '—') },
      {
        label: 'Discount',
        format: (item) => {
          if (item.is_percentage) {
            return chalk.magenta(`${item.discount_value}%`);
          }
          return chalk.magenta(`${item.discount_value}${item.currency ? ' ' + item.currency : ''}`);
        },
      },
      {
        label: 'Type',
        format: (item) => item.is_percentage ? chalk.cyan('Percentage') : chalk.white('Fixed'),
      },
      {
        label: 'Status',
        format: (item) => item.is_active ? chalk.green('● Active') : chalk.red('○ Inactive'),
      },
      {
        label: 'Used',
        format: (item) => item.times_used != null
          ? (item.times_used > 0 ? chalk.white(String(item.times_used)) : chalk.gray('0'))
          : chalk.gray('—'),
      },
      {
        label: 'Created',
        format: (item) => item.created_at ? chalk.blue(item.created_at.slice(0, 10)) : chalk.gray('—'),
      },
    ];

    const t = new Table({
      head: columns.map((c) => chalk.cyan.bold(c.label)),
      style: { head: [], border: ['gray'] },
      wordWrap: true,
    });

    for (const item of items) {
      t.push(columns.map((c) => c.format(item)));
    }

    console.log(t.toString());

    if (pagination) {
      this.printPaginationInfo(pagination);
    }
  }

  /**
   * Render a clean, human-readable summary of a single coupon.
   */
  static outputCouponDetail(data: any) {
    const coupon = data;
    if (!coupon || typeof coupon !== 'object') { console.log(data); return; }

    const line = (label: string, value: string) =>
      console.log(`  ${chalk.yellow(label.padEnd(20))} ${value}`);
    const sep = () => console.log(chalk.gray('  ' + '─'.repeat(52)));

    console.log();

    // Header
    const statusBadge = coupon.is_active ? chalk.green('● Active') : chalk.red('○ Inactive');
    const typeBadge = coupon.is_percentage ? chalk.cyan('[Percentage]') : chalk.white('[Fixed]');
    console.log(
      chalk.white.bold(`  ${coupon.name || '—'}`) +
      chalk.gray('  ') + statusBadge +
      chalk.gray('  ') + typeBadge
    );
    console.log(chalk.gray(`  ${coupon.id ?? '—'}`));
    sep();

    // Discount
    if (coupon.is_percentage) {
      line('Discount', chalk.magenta(`${coupon.discount_value}%`));
    } else {
      line('Discount', chalk.magenta(`${coupon.discount_value}${coupon.currency ? ' ' + coupon.currency : ''}`));
      if (coupon.currency) line('Currency', chalk.yellow(coupon.currency));
    }

    line('Times Used', coupon.times_used != null ? chalk.white(String(coupon.times_used)) : chalk.gray('0'));
    sep();

    // Dates
    if (coupon.created_at) line('Created', chalk.blue(coupon.created_at.slice(0, 10)));
    if (coupon.updated_at) line('Updated', chalk.blue(coupon.updated_at.slice(0, 10)));

    console.log();
  }

  /**
   * Render a curated, readable table for payment list results.
   * Only shows the most useful columns.
   */
  static outputPaymentTable(data: any, options: OutputOptions = {}) {
    const format = options.format || 'pretty';

    if (format === 'json') {
      OutputFormatter.output(data, { format: 'json' });
      return;
    }

    const items = this.extractItems(data);
    const pagination = this.extractPagination(data);

    if (!Array.isArray(items) || items.length === 0) {
      console.log(chalk.yellow('No payments found'));
      return;
    }

    const columns: { label: string; format: (item: any) => string }[] = [
      {
        label: 'ID',
        format: (item) => chalk.white.dim(item.id ?? '—'),
      },
      {
        label: 'Amount',
        format: (item) => chalk.magenta(`${item.amount} ${item.currency ?? 'SAR'}`),
      },
      {
        label: 'Status',
        format: (item) => this.formatValueColored(item.current_status, 'status'),
      },
      {
        label: 'Type',
        format: (item) => chalk.white(item.type ?? '—'),
      },
      {
        label: 'Method',
        format: (item) => chalk.cyan(item.payment_method ?? '—'),
      },
      {
        label: 'Scheduled',
        format: (item) => item.scheduled_on
          ? chalk.blue(item.scheduled_on.slice(0, 10))
          : chalk.gray('—'),
      },
      {
        label: 'Paid At',
        format: (item) => item.payed_at
          ? chalk.green(item.payed_at.slice(0, 10))
          : chalk.gray('—'),
      },
      {
        label: 'Refunded At',
        format: (item) => item.refunded_at
          ? chalk.red(item.refunded_at.slice(0, 10))
          : chalk.gray('—'),
      },
    ];

    const t = new Table({
      head: columns.map((c) => chalk.cyan.bold(c.label)),
      style: {
        head: [],
        border: ['gray'],
      },
      wordWrap: true,
    });

    for (const item of items) {
      t.push(columns.map((c) => c.format(item)));
    }

    console.log(t.toString());

    if (pagination) {
      this.printPaginationInfo(pagination);
    }
  }

  /**
   * Render a clean, human-readable summary of a single payment.
   * Used by payment get, mark-paid, refund, auto-charge.
   */
  static outputPaymentDetail(data: any, options: OutputOptions = {}) {
    const format = options.format || 'pretty';

    if (format === 'json') {
      OutputFormatter.output(data, { format: 'json' });
      return;
    }

    if (format === 'table') {
      this.outputPaymentTable({ data: [data] }, options);
      return;
    }

    // pretty (default)
    const p = data;
    if (!p || typeof p !== 'object') {
      console.log(data);
      return;
    }

    const line = (label: string, value: string) =>
      console.log(`  ${chalk.yellow(label.padEnd(22))} ${value}`);

    const sep = () => console.log(chalk.gray('  ' + '─'.repeat(52)));

    console.log();

    // ── Header ──────────────────────────────────────────────
    const statusColor = this.formatValueColored(p.current_status, 'status');
    console.log(
      chalk.cyan.bold(`  Payment ${p.id ? p.id.slice(0, 8) : '—'}`) +
      chalk.gray('  ') + statusColor +
      (p.type ? chalk.gray(`  [${p.type}]`) : '')
    );
    console.log(chalk.gray(`  ${p.id ?? '—'}`));
    sep();

    // ── Amounts ─────────────────────────────────────────────
    const cur = p.currency ?? 'SAR';
    line('Amount', chalk.magenta(`${p.amount ?? '—'} ${cur}`));
    line('Currency', chalk.yellow(cur));
    if (p.payment_method) {
      line('Payment Method', chalk.cyan(p.payment_method));
    }
    sep();

    // ── Dates ───────────────────────────────────────────────
    if (p.scheduled_on) {
      line('Scheduled', chalk.blue(p.scheduled_on.slice(0, 10)));
    }
    if (p.payed_at) {
      line('Paid At', chalk.blue(p.payed_at.slice(0, 10)));
    }
    sep();

    // ── Refund info (only if present) ───────────────────────
    if (p.refund_reason || p.refund_note || p.refunded_at) {
      if (p.refund_reason) {
        line('Refund Reason', chalk.red(p.refund_reason));
      }
      if (p.refund_note) {
        line('Refund Note', chalk.red(p.refund_note));
      }
      if (p.refunded_at) {
        line('Refunded At', chalk.red(p.refunded_at.slice(0, 10)));
      }
    }

    console.log();
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

  /**
   * Format a cell value with meaningful colors based on field name semantics
   * and value type. Used exclusively by outputTable().
   */
  static formatValueColored(value: any, key: string = ''): string {
    if (value === null || value === undefined) {
      return chalk.gray('—');
    }

    // Boolean: green check / red cross
    if (typeof value === 'boolean') {
      return value ? chalk.green('✓ true') : chalk.red('✗ false');
    }

    // Arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return chalk.gray('[]');
      // Simple scalar arrays (strings/numbers) — join them
      if (typeof value[0] !== 'object') {
        return chalk.white(value.join(', '));
      }
      return chalk.gray(`[${value.length} items]`);
    }

    // Nested objects
    if (typeof value === 'object') {
      return chalk.gray('[Object]');
    }

    const str = String(value);
    const lowerKey = key.toLowerCase();

    // --- Semantic coloring by field name ---

    // Status fields
    if (lowerKey === 'status' || lowerKey.endsWith('_status')) {
      const upper = str.toUpperCase();
      if (['ACTIVE', 'PAID', 'COMPLETED', 'SUCCESS', 'SUCCEEDED', 'UNFROZEN'].includes(upper)) {
        return chalk.green(str);
      }
      if (['INACTIVE', 'CANCELLED', 'CANCELED', 'FAILED', 'VOIDED', 'REJECTED'].includes(upper)) {
        return chalk.red(str);
      }
      if (['PENDING', 'FROZEN', 'PROCESSING', 'DRAFT'].includes(upper)) {
        return chalk.yellow(str);
      }
      return chalk.white(str);
    }

    // Boolean-like string fields
    if (lowerKey.startsWith('is_') || lowerKey.startsWith('has_') || lowerKey === 'active') {
      if (str === 'true') return chalk.green('✓ true');
      if (str === 'false') return chalk.red('✗ false');
    }

    // Amount / price / monetary fields — magenta
    if (
      lowerKey === 'amount' ||
      lowerKey.includes('_amount') ||
      lowerKey.includes('price') ||
      lowerKey.includes('_value') ||
      lowerKey === 'discount_value' ||
      lowerKey === 'total'
    ) {
      return chalk.magenta(str);
    }

    // Currency fields — yellow
    if (lowerKey === 'currency' || lowerKey.endsWith('_currency')) {
      return chalk.yellow(str);
    }

    // ID fields — dim white (not important to highlight)
    if (lowerKey === 'id' || lowerKey.endsWith('_id')) {
      return chalk.white.dim(str);
    }

    // Date/time fields — blue
    if (
      lowerKey.includes('_at') ||
      lowerKey.includes('_date') ||
      lowerKey === 'valid_until' ||
      lowerKey === 'created_at' ||
      lowerKey === 'updated_at'
    ) {
      return chalk.blue(str);
    }

    // Name fields — bright white
    if (lowerKey === 'name' || lowerKey.endsWith('_name')) {
      return chalk.white.bold(str);
    }

    // Email fields — cyan
    if (lowerKey === 'email' || lowerKey.includes('email')) {
      return chalk.cyan(str);
    }

    // Phone fields — cyan
    if (lowerKey === 'phone' || lowerKey.includes('phone')) {
      return chalk.cyan(str);
    }

    // URL fields — underline blue
    if (lowerKey.includes('url') || lowerKey.includes('link')) {
      return chalk.blue.underline(str);
    }

    // Default
    return chalk.white(str);
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
