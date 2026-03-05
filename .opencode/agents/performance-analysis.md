# Performance Analysis Report

**Generated:** 2026-03-05
**Agent:** Performance Analyzer and Bug Fixer

---

## 1. Performance Timing Results

| Command | Time (seconds) | Assessment |
|---------|----------------|------------|
| `streampay --help` | 0.120 | ✅ Acceptable |
| `streampay --version` | 0.124 | ✅ Acceptable |
| `streampay --all-flags` | 0.143 | ✅ Acceptable |
| `streampay consumers --help` | 0.125 | ✅ Acceptable |

**Verdict:** CLI startup time is ~120-140ms which is within acceptable range for Node.js CLIs. No critical performance issues detected at the timing level.

---

## 2. Bottleneck Analysis

### 2.1 Synchronous File Reads (Minor)

**Location:** `src/index.ts:21-23`
```typescript
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
);
```

**Location:** `src/config.ts:28` and `src/config.ts:62`
```typescript
const fileConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
```

**Impact:** Low (~1-5ms). Only reads small JSON files.

**Recommendation:** Convert to async `fs.promises.readFile` for consistency, but not urgent.

---

### 2.2 Duplicate dotenv Loading (Minor)

**Location:** `src/index.ts:4` AND `src/config.ts:6`
```typescript
dotenv.config();
```

**Impact:** dotenv is loaded twice, adding ~2-3ms overhead.

**Recommendation:** Remove the `dotenv.config()` call from `src/config.ts` since it's already called in the entry point.

---

### 2.3 Eager Module Imports (Moderate)

**Location:** `src/index.ts:10-19`
```typescript
import { createCheckoutCommands } from './commands/checkout';
import { createConfigCommand, createLoginCommand, createLogoutCommand } from './commands/config';
import { createMeCommand } from './commands/me';
import { createConsumersCommands } from './commands/consumers';
import { createCouponsCommands } from './commands/coupons';
import { createInvoiceCommands } from './commands/invoices';
import { createPaymentsCommands } from './commands/payments';
import { createProductCommands } from './commands/products';
import { createSubscriptionCommands } from './commands/subscriptions';
import { createWebhookCommands } from './commands/webhooks';
```

**Impact:** All 9 command modules are loaded at startup regardless of which command is actually invoked. This adds ~30-50ms to startup.

**Recommendation:** Implement lazy loading for commands using dynamic imports:
```typescript
// Instead of static imports, use lazy registration:
program.addCommand({
  name: 'payments',
  commandClass: () => import('./commands/payments').then(m => m.createPaymentsCommands())
});
```

Note: Commander.js doesn't natively support lazy command loading, so this would require refactoring to a different pattern or using a wrapper.

---

### 2.4 No Caching of Config Reads (Minor)

**Location:** `src/config.ts:23-50`

Every call to `ConfigManager.getConfig()` reads the config file from disk again.

**Impact:** Minimal (config is typically read once per command execution).

**Recommendation:** Add a simple in-memory cache:
```typescript
private static cachedConfig: Config | null = null;

static getConfig(): Config {
  if (this.cachedConfig) return this.cachedConfig;
  // ... existing logic
  this.cachedConfig = config;
  return config;
}
```

---

## 3. Payments Format Issue

### 3.1 Problem Identified

**File:** `src/commands/payments.ts:61`
```typescript
.option('--format <format>', 'Output format: json, table, pretty', 'table')
```

The `--format` option **lists 'pretty' as a valid choice**, but the list command **does not handle it correctly**.

### 3.2 Code Evidence

**Payments list action** (`src/commands/payments.ts:92-93`):
```typescript
const result = await client.listPayments(params);
OutputFormatter.outputPaymentTable(result, { format: options.format });
```

**OutputFormatter.outputPaymentTable** (`src/utils.ts:1192-1198`):
```typescript
static outputPaymentTable(data: any, options: OutputOptions = {}) {
  const format = options.format || 'pretty';

  if (format === 'json') {
    OutputFormatter.output(data, { format: 'json' });
    return;
  }

  // ... rest outputs table format
  // 'pretty' option is IGNORED - always outputs table!
}
```

**The 'pretty' format is never used** - when you specify `--format pretty`, it falls through to the table output.

### 3.3 Comparison with Working Commands

**Consumers list** (`src/commands/consumers.ts:159-165`):
```typescript
if (options.format === 'json') {
  OutputFormatter.output(result, { format: 'json' });
} else if (options.format === 'pretty') {
  OutputFormatter.outputPretty(result);  // ✅ 'pretty' is handled!
} else {
  OutputFormatter.outputConsumerTable(result);
}
```

Consumers properly handles all three formats. Payments does not.

---

## 4. Recommended Fixes

### Fix 1: Payments Format Handling (HIGH PRIORITY)

**File:** `src/commands/payments.ts`

Replace lines 92-93 with:
```typescript
const result = await client.listPayments(params);

if (options.format === 'json') {
  OutputFormatter.output(result, { format: 'json' });
} else if (options.format === 'pretty') {
  OutputFormatter.outputPretty(result);
} else {
  OutputFormatter.outputPaymentTable(result, { format: 'table' });
}
```

### Fix 2: Remove Duplicate dotenv (LOW PRIORITY)

**File:** `src/config.ts`

Remove line 6:
```typescript
// DELETE THIS LINE:
dotenv.config();
```

### Fix 3: Add Config Caching (LOW PRIORITY)

**File:** `src/config.ts`

Add cache field and modify getConfig:
```typescript
export class ConfigManager {
  private static configPath = path.join(os.homedir(), '.streampay', 'config.json');
  private static configCache: Config | null = null;

  static getConfig(): Config {
    if (this.configCache) {
      return this.configCache;
    }
    // ... existing logic ...
    this.configCache = config;
    return config;
  }

  static clearCache(): void {
    this.configCache = null;
  }
}
```

Update `saveConfig` and `clearConfig` to call `clearCache()`.

### Fix 4: Async Package.json Read (OPTIONAL)

**File:** `src/index.ts`

This requires restructuring since top-level await isn't available in CommonJS. Keep as-is for simplicity.

---

## 5. Summary

| Issue | Severity | Effort | Impact |
|-------|----------|--------|--------|
| Payments 'pretty' format broken | HIGH | Low | Users can't use pretty format for payments list |
| Duplicate dotenv.config() | LOW | Trivial | ~2-3ms wasted |
| Eager command imports | MEDIUM | High | ~30-50ms startup overhead |
| No config caching | LOW | Low | Negligible for typical use |

**Priority:** Fix the payments format issue first - it's a functional bug that prevents users from using the documented `--format pretty` option.
