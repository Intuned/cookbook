# CDP Connection Example

This template demonstrates how to connect to a browser using Chrome DevTools Protocol (CDP) with Intuned. It shows you how to:

- Retrieve the CDP URL from Intuned runtime
- Fetch browser information via CDP endpoints
- Create CDP sessions and execute CDP commands
- Understand WebDriver vs CDP protocols
- Use Playwright with an existing CDP connection
- Navigate pages and extract information

## What is CDP?

**Chrome DevTools Protocol (CDP)** is a low-level protocol that allows tools to instrument, inspect, debug, and profile Chromium-based browsers (Chrome, Edge, etc.). CDP provides deep access to browser internals and is the most powerful protocol for browser automation.

**Key features of CDP:**
- Chrome/Chromium-specific protocol
- Direct access to browser DevTools features
- Real-time debugging and profiling
- Network interception and modification
- Performance monitoring
- JavaScript execution in any context
- Screenshot and PDF generation
- DOM manipulation and inspection

## What is WebDriver?

**WebDriver** is a W3C standard protocol for browser automation that works across different browsers (Chrome, Firefox, Safari, Edge). It's a higher-level, cross-browser API designed for testing and automation.

**Key features of WebDriver:**
- Cross-browser compatibility (W3C standard)
- Browser-agnostic API
- Session-based (uses session IDs)
- Standardized commands
- Less powerful than CDP but more portable

## CDP vs WebDriver

| Feature | CDP | WebDriver |
|---------|-----|-----------|
| **Browser Support** | Chrome/Chromium only | Cross-browser (Chrome, Firefox, Safari, Edge) |
| **Protocol Type** | Low-level, Chrome-specific | High-level, standardized (W3C) |
| **Power/Features** | Very powerful, deep browser access | Limited to standard automation commands |
| **Use Cases** | Performance profiling, network inspection, debugging | Cross-browser testing, standard automation |
| **Session Management** | No session IDs | Session-based with session IDs |
| **API Stability** | Can change with Chrome versions | Stable W3C standard |

**When to use CDP:**
- Need Chrome/Edge-specific features
- Require advanced capabilities (network interception, performance profiling)
- Building Chrome-only tools
- Need real-time DevTools access

**When to use WebDriver:**
- Need cross-browser support
- Standard automation tasks
- Testing across multiple browsers
- Prefer stable, standardized API

In this example, we use **CDP** because Intuned provides a CDP connection, giving you access to powerful Chrome-specific features. Playwright uses CDP under the hood for Chromium browsers.

## Getting Started

To get started developing browser automation projects with Intuned, check out the
- Intuned docs [here](https://docs.intunedhq.com/docs/00-getting-started/introduction)
- CLI docs [here](https://docs.intunedhq.com/docs/05-references/cli)
- Intuned.jsonc docs [here](https://docs.intunedhq.com/docs/05-references/intuned-json#intuned-json)

## Development

> **_NOTE:_**  All commands support `--help` flag to get more information about the command and its arguments and options.

### Install dependencies
```bash
# npm
npm install

# yarn
yarn
```

> **_NOTE:_**  If you are using `npm`, make sure to pass `--` when using options with the `intuned` command.

### Run an API

```bash
# npm
npm run intuned run api connect-to-cdp .parameters/api/connect-to-cdp/default.json

# yarn
yarn intuned run api connect-to-cdp .parameters/api/connect-to-cdp/default.json
```

### Save project

```bash
# npm
npm run intuned run save

# yarn
yarn intuned run save
```

Reference for saving project [here](https://docs.intunedhq.com/docs/02-features/local-development-cli#use-runtime-sdk-and-browser-sdk-helpers)

### Deploy project
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy

```

### `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview).

## Project Structure
The project structure is as follows:
```
/
├── api/                      # Your API endpoints
│   └── connect-to-cdp.ts     # CDP connection example
├── hooks/                    # Setup hooks that run before API execution
│   └── setupContext.ts       # Captures CDP URL from Intuned runtime
├── utils/                    # Utility functions and schemas
│   └── typesAndSchemas.ts    # Zod schemas and TypeScript types
├── .parameters/              # Parameter files for testing APIs
│   └── api/                  # API parameters folder
│       └── connect-to-cdp/   # Parameters for CDP connection API
│           └── default.json  # Default parameters (URL to navigate to)
└── Intuned.jsonc             # Intuned project configuration file
```

## Envs

This project requires the following environment variables:

- `INTUNED_API_KEY`: Your Intuned API key for authentication. Get it from [Intuned Dashboard](https://dashboard.intunedhq.com)

## How It Works

The `connect-to-cdp.ts` API demonstrates the following:

1. **Setup Hook**: The `hooks/setupContext.ts` captures the CDP URL from Intuned's runtime and stores it in `attemptStore`
2. **Parameter Validation**: Uses Zod schemas to validate input parameters (`url`) with `safeParse()` for type-safe validation
3. **Retrieve CDP URL**: Gets the CDP URL from `attemptStore` (automatically provided by Intuned)
4. **Fetch Browser Info**: Makes HTTP requests to CDP endpoints to get browser version, protocol version, and WebSocket URL
5. **Create CDP Session**: Creates a CDP session using `context.newCDPSession(page)` to execute CDP commands
6. **Get WebDriver Capabilities**: Demonstrates getting browser capabilities and explains the difference between WebDriver and CDP
7. **Use Playwright**: The `page` object provided by Intuned is already connected via CDP - no additional setup needed
8. **Navigate & Extract**: Demonstrates basic navigation and information extraction from the page

## Parameter Validation with Zod

This project uses Zod for runtime type validation and schema validation. The schemas are defined in `utils/typesAndSchemas.ts`:

```typescript
import { connectToCdpParamsSchema } from "../utils/typesAndSchemas.js";

// Validate parameters
const validationResult = connectToCdpParamsSchema.safeParse(params);

if (!validationResult.success) {
  // Handle validation errors
  throw new Error(`Parameter validation failed: ${errors}`);
}

const { url } = validationResult.data;
```

**Benefits of Zod validation:**
- Runtime type safety
- Clear error messages
- Automatic TypeScript type inference
- URL format validation
- Required field validation

## CDP Sessions and Commands

### Creating a CDP Session

```typescript
const cdpSession = await context.newCDPSession(page);
```

A CDP session allows you to send low-level CDP commands directly to the browser.

### Example CDP Commands

```typescript
// Get browser version
const version = await cdpSession.send("Browser.getVersion");

// Enable network tracking
await cdpSession.send("Network.enable");

// Get performance metrics
const metrics = await cdpSession.send("Performance.getMetrics");

// Take a screenshot
const screenshot = await cdpSession.send("Page.captureScreenshot");

// Always detach when done
await cdpSession.detach();
```

### Common CDP Domains

- **Browser**: Browser-level operations
- **Page**: Page-level operations (navigation, screenshots)
- **Network**: Network interception and monitoring
- **Performance**: Performance metrics and profiling
- **Runtime**: JavaScript execution
- **DOM**: DOM manipulation and inspection
- **Debugger**: JavaScript debugging
- **Emulation**: Device and media emulation

## CDP Endpoints

When you have the CDP URL, you can access various CDP endpoints:

- `GET {cdpUrl}/json/version` - Get browser version information
- `GET {cdpUrl}/json` - List all available targets (pages, service workers, etc.)
- `GET {cdpUrl}/json/protocol` - Get the full protocol definition
- `WebSocket {webSocketDebuggerUrl}` - Connect via WebSocket for real-time CDP communication

## Learn More

- [Chrome DevTools Protocol Documentation](https://chromedevtools.github.io/devtools-protocol/)
- [Playwright CDP Documentation](https://playwright.dev/docs/api/class-cdpsession)
- [Intuned Runtime SDK](https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/runtime/variables/attemptStore)
