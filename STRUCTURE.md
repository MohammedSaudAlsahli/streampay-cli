# Stream Pay CLI - Project Structure

## Overview
Complete CLI tool for interacting with Stream App API, designed for both developers and AI agents.

## Project Structure

```
streampay-cli/
├── package.json                 # Project metadata and dependencies
├── tsconfig.json               # TypeScript configuration
├── setup.sh                    # Quick setup script
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── README.md                   # Main documentation
├── AI-AGENT-GUIDE.md          # AI agent integration guide
│
├── src/                        # Source code
│   ├── index.ts               # Main CLI entry point
│   ├── client.ts              # Stream App API client
│   ├── config.ts              # Configuration manager
│   ├── utils.ts               # Utility functions
│   │
│   └── commands/              # Command modules
│       ├── config.ts          # Config commands
│       ├── consumer.ts        # Consumer commands
│       ├── payment.ts         # Payment commands
│       ├── subscription.ts    # Subscription commands
│       └── resources.ts       # Invoice, Product, Coupon, Payment Link
│
├── examples/                   # Example JSON files
│   ├── consumer-create.json
│   └── subscription-create.json
│
└── dist/                      # Compiled JavaScript (after build)
```

## Key Files

### Configuration Files

- **package.json**: Defines project metadata, dependencies, and scripts
- **tsconfig.json**: TypeScript compiler configuration
- **.env.example**: Template for environment variables

### Source Files

- **src/index.ts**: Main entry point that sets up all commands
- **src/client.ts**: HTTP client for Stream App API
- **src/config.ts**: Manages configuration from env vars, files, and CLI
- **src/utils.ts**: Output formatting and helper functions

### Command Modules

Each command module follows the same pattern:
- Uses Commander.js for CLI parsing
- Supports JSON/Table/Pretty output formats
- Includes pagination and filtering
- Comprehensive error handling

### Documentation

- **README.md**: Installation, usage, and examples
- **AI-AGENT-GUIDE.md**: Detailed guide for AI agent integration
- **STRUCTURE.md**: This file - project organization

## Technology Stack

- **TypeScript**: Type-safe development
- **Commander.js**: CLI framework
- **Axios**: HTTP client
- **Chalk**: Terminal colors
- **Table**: Tabular output
- **Ora**: Loading spinners
- **dotenv**: Environment variable management

## Build Process

1. TypeScript files in `src/` are compiled to JavaScript
2. Output goes to `dist/` directory
3. `dist/index.js` becomes the executable entry point

## Command Pattern

All commands follow this structure:

```typescript
command
  .command('action')
  .description('What it does')
  .argument('<required>', 'Description')
  .option('--optional <value>', 'Description', default)
  .action(async (args, options) => {
    // 1. Get configuration
    // 2. Create API client
    // 3. Execute operation
    // 4. Format and output results
  });
```

## API Client Features

- Automatic branch scoping via X-Branch header
- Centralized error handling
- Type-safe request/response
- Support for all Stream App endpoints

## Configuration Priority

1. CLI flags (`--api-key`)
2. Environment variables (`STREAMPAY_API_KEY`)
3. Config file (`~/.streampay/config.json`)
4. Defaults

## Output Formats

### JSON (`--format json`)
- Machine-readable
- Perfect for AI agents
- Includes full response data

### Table (`--format table`)
- Columnar view
- Good for list operations
- Human-readable

### Pretty (`--format pretty`) - Default
- Colored output
- Nested object visualization
- Best for interactive use

## Extension Points

The CLI can be extended by:

1. **Adding new commands**: Create new files in `src/commands/`
2. **Adding new API methods**: Update `src/client.ts`
3. **Custom formatters**: Extend `src/utils.ts`
4. **MCP Server**: Wrap the CLI for direct AI agent access

## Testing Recommendations

- Use `examples/` directory for sample data
- Test with `--format json` for automation
- Use different branches for testing vs production
- Validate JSON before sending to API

## AI Agent Integration

The CLI is optimized for AI agents through:

- Consistent command structure
- JSON output format
- Exit codes for success/failure
- Structured error messages
- Full API coverage
- Scriptable operations

## Deployment

### Local Development
```bash
npm install
npm run build
npm link
```

### Global Installation
```bash
npm install -g streampay-cli
```

### Docker (Future)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
ENTRYPOINT ["node", "dist/index.js"]
```

## Versioning

Follows semantic versioning (SemVer):
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

Current version: 1.0.0

## Support

- Documentation: README.md
- AI Integration: AI-AGENT-GUIDE.md
- Examples: examples/ directory
- Issues: GitHub Issues
