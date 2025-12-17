# Playwright Basics

A simple and reusable TypeScript template for Playwright that covers the core automation basics like navigation, interactions, scraping, pagination, and file handling.

## Features

This template includes examples for common automation patterns:

- **Form Submission** (`examples/submitForm`) - Fill and submit multi-step forms with validation
- **Web Scraping** (`examples/scrapeList`) - Extract structured data from tables and lists
- **Pagination** - Navigate through paginated content:
  - `examples/navigateAllPages` - Navigate through all available pages
  - `examples/navigateNPages` - Navigate a specific number of pages
- **File Handling** (`examples/downloadAndUploadFile`) - Download files and upload them to S3

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts#runs%3A-executing-your-automations).

## Development

> **_NOTE:_** All commands support `--help` flag to get more information about the command and its arguments and options.

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
# Run the sample API
yarn intuned run api sample

# Run the examples with parameters from .parameters folder
yarn intuned run api examples/submitForm --parameters-file .parameters/examples/submitForm/default.json
yarn intuned run api examples/navigateNPages --parameters-file .parameters/examples/navigateNPages/default.json

# Run the examples without parameters
yarn intuned run api examples/navigateAllPages
yarn intuned run api examples/scrapeList
yarn intuned run api examples/downloadAndUploadFile
```

### Deploy project
```bash
# npm
npm run intuned deploy

# yarn
yarn intuned deploy

```




### Environment Variables

Some APIs in this project may require environment variables to be set. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Then configure the following variables:

- `INTUNED_API_KEY`: Your Intuned API key (required for running APIs locally)

#### S3 Upload Configuration (downloadAndUploadFile example)

The `downloadAndUploadFile` example requires AWS S3 credentials. Update the configuration in `api/examples/downloadAndUploadFile.ts`:

```typescript
const s3Config: S3Configs = {
  bucket: "your-bucket-name",
  region: "your-region",
  accessKeyId: "your-access-key-id",
  secretAccessKey: "your-secret-access-key",
};
```

### `@intuned/browser`: Intuned Browser SDK

This project uses Intuned browser SDK. For more information, check out the [Intuned Browser SDK documentation](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview).




## Project Structure
The project structure is as follows:
```
/
├── api/                      # Folder containing all your API endpoint logic
│   ├── sample.ts            # Default or main API endpoint file
│   └── examples/              # Folder with example scripts for reference or testing
│       ├── submitForm.ts     # Example script demonstrating how to fill and submit forms
│       ├── scrapeList.ts     # Example script showing how to scrape lists of data
│       ├── navigateAllPages.ts  # Example showing how to navigate through all pages of a paginated site
│       ├── navigateNPages.ts   # Example showing how to navigate a specific number of pages
│       └── downloadAndUploadFile.ts  # Example demonstrating file download and upload functionality
├── .parameters/              # Folder containing test parameters for APIs
│   ├── sample/
│   │   └── default.json     # Default parameters for sample API
│   └── examples/
│       ├── submitForm/
│       │   └── default.json # Parameters for submitForm example
│       └── navigateNPages/
│           └── default.json # Parameters for navigateNPages example
└── Intuned.jsonc             # Intuned project configuration file (defines project settings, environment, etc.)
```


## API Examples

### sample.ts

A basic template API endpoint for getting started.

### examples/submitForm.ts

Demonstrates multi-step form submission with address and payment information. Parameters include:
- Personal details (firstName, lastName)
- Address details (address1, address2, city, state, zipCode, country)
- Payment details (nameOnCard, cardNumber, expiration, cvv)

### examples/scrapeList.ts

Scrapes structured data from a table, extracting ID, name, and status for each row.

### examples/navigateAllPages.ts

Navigates through all pages of a paginated website and scrapes book titles from each page.

### examples/navigateNPages.ts

Navigates through a specific number of pages. Requires the `pagesToNavigate` parameter.

### examples/downloadAndUploadFile.ts

Downloads a file from a website and uploads it to AWS S3. Returns signed URL and file path.

## Configuration

For detailed configuration options, see the [Intuned.jsonc reference documentation](https://docs.intunedhq.com/docs/05-references/intuned-json).
  