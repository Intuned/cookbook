# captcha-solving-basic-example Intuned project

Comprehensive demonstration of Intuned's captcha solving capabilities across multiple captcha types.

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).


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

Run the main captcha solver API (runs all captcha types sequentially):
```bash
# npm
npm run intuned run api captchaSolver -- --parameters-file .parameters/captchaSolver/default.json

# yarn
yarn intuned run api captchaSolver --parameters-file .parameters/captchaSolver/default.json
```

Run individual captcha solver functions:
```bash
# Custom Captcha
yarn intuned run api captchaSolver:customCaptcha --parameters-file .parameters/captchaSolver/default.json

# GeeTest
yarn intuned run api captchaSolver:geetest --parameters-file .parameters/captchaSolver/default.json

# reCAPTCHA v2 Enterprise
yarn intuned run api captchaSolver:recaptcha --parameters-file .parameters/captchaSolver/default.json

# Cloudflare Challenge
yarn intuned run api captchaSolver:cloudflareChallenge --parameters-file .parameters/captchaSolver/default.json

# Cloudflare Turnstile
yarn intuned run api captchaSolver:cloudflareTurnstile --parameters-file .parameters/captchaSolver/default.json
```

### Deploy project
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy

```

## Envs

This project does not require any environment variables.



### `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/overview).




## Project Structure
The project structure is as follows:
```
├── .parameters/
│   └── captchaSolver/
│       └── default.json          # Default parameters for captchaSolver API
├── api/
│   └── captchaSolver.ts          # Main API with all captcha solving examples
├── helpers/
│   └── captcha.ts                # Helper function for captcha solving with decorator pattern
├── package.json                  # TypeScript project dependencies
└── Intuned.jsonc                 # Intuned project configuration file
```

## How It Works

This project demonstrates solving 5 different types of captchas:

1. **Custom Captcha** - Basic image-based captcha with custom selectors
2. **GeeTest** - Popular sliding puzzle captcha
3. **reCAPTCHA v2 Enterprise** - Google's enterprise reCAPTCHA
4. **Cloudflare Challenge** - Cloudflare's bot detection challenge
5. **Cloudflare Turnstile** - Modern Cloudflare verification

Each captcha type can be tested individually using the exported functions, or all can be run sequentially using the default handler.

### Two Solving Patterns

**Callable Pattern:**
```typescript
await page.goto("https://example.com");
await waitForCaptchaSolve(page, {
  timeoutInMs: 30_000,
  settlePeriodInMs: 10_000
});
```

**Decorator Pattern:**
```typescript
await goToWithCaptchaSolve(page, "https://example.com");
```

## Configuration

All captcha solving is configured in `Intuned.jsonc`:

```jsonc
{
  "captchaSolver": {
    "enabled": true,
    "googleRecaptchaV2": { "enabled": true },
    "cloudflare": { "enabled": true },
    "geetest": { "enabled": true },
    "customCaptcha": {
      "enabled": true,
      "imageLocators": ["#demoCaptcha_CaptchaImage"],
      "inputLocators": ["#captchaCode"],
      "submitLocators": ["#validateCaptchaButton"]
    },
    "settings": {
      "autoSolve": true,
      "maxRetries": 10
    }
  }
}
```


## `Intuned.json` Reference
```jsonc
{
  // Your Intuned workspace ID.
  // Optional - If not provided here, it must be supplied via the `--workspace-id` flag during deployment.
  "workspaceId": "your_workspace_id",

  // The name of your Intuned project.
  // Optional - If not provided here, it must be supplied via the command line when deploying.
  "projectName": "your_project_name",

  // Replication settings
  "replication": {
    // The maximum number of concurrent executions allowed via Intuned API. This does not affect jobs.
    // A number of machines equal to this will be allocated to handle API requests.
    // Not applicable if api access is disabled.
    "maxConcurrentRequests": 1,

    // The machine size to use for this project. This is applicable for both API requests and jobs.
    // "standard": Standard machine size (6 shared vCPUs, 2GB RAM)
    // "large": Large machine size (8 shared vCPUs, 4GB RAM)
    // "xlarge": Extra large machine size (1 performance vCPU, 8GB RAM)
    "size": "standard"
  }

  // Auth session settings
  "authSessions": {
    // Whether auth sessions are enabled for this project.
    // If enabled, "auth-sessions/check.ts" API must be implemented to validate the auth session.
    "enabled": true,

    // Whether to save Playwright traces for auth session runs.
    "saveTraces": false,

    // The type of auth session to use.
    // "API" type requires implementing "auth-sessions/create.ts" API to create/recreate the auth session programmatically.
    // "MANUAL" type uses a recorder to manually create the auth session.
    "type": "API",


    // Recorder start URL for the recorder to navigate to when creating the auth session.
    // Required if "type" is "MANUAL". Not used if "type" is "API".
    "startUrl": "https://example.com/login",

    // Recorder finish URL for the recorder. Once this URL is reached, the recorder stops and saves the auth session.
    // Required if "type" is "MANUAL". Not used if "type" is "API".
    "finishUrl": "https://example.com/dashboard",

    // Recorder browser mode
    // "fullscreen": Launches the browser in fullscreen mode.
    // "kiosk": Launches the browser in kiosk mode (no address bar, no navigation controls).
    // Only applicable for "MANUAL" type.
    "browserMode": "fullscreen"
  }

  // API access settings
  "apiAccess": {
    // Whether to enable consumption through Intuned API. If this is false, the project can only be consumed through jobs.
    // This is required for projects that use auth sessions.
    "enabled": true
  },

  // Whether to run the deployed API in a headful browser. Running in headful can help with some anti-bot detections. However, it requires more resources and may work slower or crash if the machine size is "standard".
  "headful": false,

  // The region where your Intuned project is hosted.
  // For a list of available regions, contact support or refer to the documentation.
  // Optional - Default: "us"
  "region": "us"
}
```
