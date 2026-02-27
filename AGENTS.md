# AGENTS.md — Coding Agent Guide for streampay-cli

This file provides instructions for AI coding agents (Claude Code, Cursor, Copilot, etc.) working in this repository.

---

## Project Overview

`streampay-cli` is a Node.js CLI tool written in TypeScript that wraps the StreamPay API. It uses [Commander.js](https://github.com/tj/commander.js) for command registration, Axios for HTTP calls, Chalk for terminal output, and the `table` library for ASCII table rendering. There is no frontend, no React, and no browser — this is a pure Node.js CLI.

**Entry point:** `src/index.ts`
**Compiled output:** `dist/` (generated, do not edit manually)

---

## Commands

### Build

```bash
npm run build        # Compile TypeScript → dist/ via tsc
npm run dev          # Run directly with ts-node (no compile step)
npm run start        # Run compiled output: node dist/index.js
```

### Setup (first time)

```bash
bash setup.sh        # npm install + build + npm link (installs `streampay` globally)
```

### Structure sanity check (not a unit test runner)

```bash
bash test-structure.sh   # Verifies required files exist and checks key imports/patterns
```

### No test framework is configured

There are no unit tests, no Jest/Vitest/Mocha setup, and no `test` npm script. To add tests:
```bash
npm install --save-dev jest @types/jest ts-jest
```
Until then, validate changes by running `npm run build` and manual CLI smoke tests:
```bash
node dist/index.js --help
node dist/index.js consumer --help
```

---

## TypeScript Configuration

All TypeScript lives under `src/`. The compiler outputs to `dist/`.

Key `tsconfig.json` settings:
- `"strict": true` — all strict checks enabled; **never disable this**
- `"target": "ES2020"`, `"module": "commonjs"` — Node.js compatible
- `"esModuleInterop": true` — allows default imports from CJS modules
- `"declaration": true` — emits `.d.ts` files alongside compiled output
- `"sourceMap": true` — enables source maps for debugging

**There is no ESLint or Prettier.** There is no `.editorconfig`. Follow the style conventions below manually.

---

## Code Style Guidelines

### Formatting

- **Indentation:** 2 spaces (no tabs)
- **Quotes:** Single quotes for all strings (`'commander'`, not `"commander"`)
- **Semicolons:** Required at end of every statement
- **Trailing commas:** Use in multi-line objects and arrays
- **Async style:** Always use `async/await`; never use `.then()/.catch()` chains
- **Line length:** No enforced limit, but keep lines readable (aim for ≤120 chars)

### Imports

Group imports in this order (no blank line required between groups, but keep them logically ordered):

```typescript
// 1. Node.js built-in modules
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// 2. Third-party packages
import { Command } from 'commander';
import axios, { AxiosInstance, AxiosError } from 'axios';
import chalk from 'chalk';

// 3. Internal modules (relative paths)
import { StreamAppClient } from '../client';
import { ConfigManager } from '../config';
import { OutputFormatter, parseJson, parseFilters } from '../utils';
```

**Avoid inline `require()` calls inside action handlers** (the pattern exists in some command files but is inconsistent — prefer top-level imports).

### Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Classes | PascalCase | `StreamAppClient`, `ConfigManager` |
| Interfaces | PascalCase | `StreamAppConfig`, `PaginationParams` |
| Functions | camelCase | `createConsumerCommands()`, `parseJson()` |
| Variables / params | camelCase | `consumerId`, `baseUrl`, `apiKey` |
| Constants | camelCase | `defaultBaseUrl` (no UPPER_SNAKE_CASE) |
| Private class fields | camelCase + `private` | `private client: AxiosInstance` |
| CLI flags | kebab-case | `--api-key`, `--sort-by` (Commander auto-converts to camelCase) |
| Source files | lowercase/camelCase | `client.ts`, `config.ts`, `utils.ts` |
| Command files | lowercase noun | `consumer.ts`, `payment.ts`, `resources.ts` |
| Markdown/docs | UPPER-KEBAB-CASE | `README.md`, `AI-AGENT-GUIDE.md` |

### Types

- Use `interface` (not `type`) for object shapes
- Use `?` for optional properties: `apiKey?: string`
- Use literal union types for constrained options: `'json' | 'table' | 'pretty'`
- `any` is acceptable for raw API request/response data (`data: any`, `result: any`)
- Use `Record<string, any>` for generic key-value maps
- Prefer type inference for return types; annotate parameters explicitly
- Do not use type assertions (`as`) unnecessarily; reserve for platform/key lookup patterns

### Error Handling

Every command action must follow this exact pattern:

```typescript
.action(async (options) => {
  try {
    const config = ConfigManager.getConfig();
    const client = new StreamAppClient({
      apiKey: ConfigManager.getApiKey(),
      ...config,
    });
    const result = await client.someMethod(params);
    OutputFormatter.success('Human-readable success message');
    OutputFormatter.output(result, { format: options.format });
  } catch (error) {
    OutputFormatter.error('Human-readable failure message', error);
    process.exit(1);
  }
});
```

Rules:
- **Always** call `process.exit(1)` in the catch block — this is critical for AI agent automation
- **Always** use `OutputFormatter.error()` to print errors (it writes to stderr with red chalk styling)
- Never swallow errors silently in command handlers (config parsing is the only exception)
- The Axios client normalizes HTTP errors in its response interceptor; do not add extra Axios error handling in command files

### Class Patterns

- `ConfigManager` and `OutputFormatter` are **static-method-only classes** used as namespaces. Do not instantiate them. Do not add instance methods to them.
- `StreamAppClient` is instantiated fresh per command action (no shared singleton). Use the spread shorthand:
  ```typescript
  new StreamAppClient({ apiKey: ConfigManager.getApiKey(), ...config })
  ```
- Every command group is wrapped in a factory function exported from its module:
  ```typescript
  export function createConsumerCommands(): Command { ... }
  ```

### Output

- Use `chalk` for all colored terminal output — **never** use raw ANSI escape codes (e.g., `\x1b[36m`)
- `OutputFormatter.success()` for success messages (green)
- `OutputFormatter.error()` for errors (red, to stderr)
- `OutputFormatter.output(data, { format })` for structured data (respects `--format json|table|pretty`)
- `OutputFormatter.outputTable()` for explicitly tabular data

---

## Project Architecture

```
src/
├── index.ts           # Registers all command groups, loads dotenv, sets CLI version
├── client.ts          # StreamAppClient — all HTTP methods, Axios interceptor
├── config.ts          # ConfigManager — reads env vars + ~/.streampay/config.json
├── utils.ts           # OutputFormatter, parseJson(), parseFilters()
└── commands/
    ├── config.ts      # streampay config (set/get/clear)
    ├── consumer.ts    # streampay consumer (create/get/list/update/delete)
    ├── payment.ts     # streampay payment (get/list/mark-paid/refund/auto-charge)
    ├── subscription.ts# streampay subscription (create/get/list/update/cancel/freeze)
    └── resources.ts   # invoice, product, coupon, payment-link commands
```

When adding a new command group:
1. Create `src/commands/<name>.ts` with a `export function create<Name>Commands(): Command` factory
2. Import and register it in `src/index.ts` via `program.addCommand(create<Name>Commands())`
3. Add the corresponding methods to `StreamAppClient` in `src/client.ts`

---

## Dependencies

| Package | Purpose |
|---|---|
| `commander` | CLI argument parsing and subcommand registration |
| `axios` | HTTP client; all API calls go through `StreamAppClient` |
| `chalk` (v4) | Terminal colors — v4 is CJS-compatible, do not upgrade to v5+ |
| `table` | ASCII table rendering in `OutputFormatter.outputTable()` |
| `dotenv` | Loads `.env` into `process.env` at startup |
| `ora` | Spinner (installed but currently unused) |

Dev dependencies: `typescript`, `ts-node`, `@types/node`

**Do not upgrade `chalk` to v5+** — v5 is ESM-only and will break the CommonJS module system used here.

---

## Environment

The CLI reads configuration from (in priority order):
1. CLI flags (`--api-key`, `--base-url`, `--branch`)
2. Environment variables (`STREAMAPP_API_KEY`, `STREAMAPP_BASE_URL`, `STREAMAPP_BRANCH`)
3. Config file at `~/.streampay/config.json`

Copy `.env.example` to `.env` for local development.
