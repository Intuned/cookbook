# Quick Recipes (TypeScript)

Ready-to-run Intuned API examples for common browser automation patterns. Each recipe is a self-contained API demonstrating a specific use case.

## Overview

This project provides practical examples of common browser automation tasks that you can use as building blocks for your own automations. Each recipe demonstrates Intuned's powerful helper functions for file handling, pagination, and data extraction.

## Getting Started

To get started developing browser automation projects with Intuned, check out our [concepts and terminology](https://docs.intunedhq.com/docs/getting-started/conceptual-guides/core-concepts).

## Prerequisites

- Node.js 18+ or compatible version
- Intuned API key
- Internet connection

## Development

### Install dependencies

```bash
cd typescript-examples/quick-recipes
yarn install
```

### Run an API

To run an API with default parameters:

```bash
yarn intuned run api <api-name> --parameters .parameters/<api-name>/default.json
```

#### Examples

```bash
# Download a file from a website
yarn intuned run api download-file --parameters .parameters/download-file/default.json

# Scrape data with pagination
yarn intuned run api pagination --parameters .parameters/pagination/default.json

# Download and upload file to S3
yarn intuned run api upload-to-s3 --parameters .parameters/upload-to-s3/default.json

# Capture and save screenshot
yarn intuned run api capture-screenshots --parameters .parameters/capture-screenshots/default.json
```

## APIs

| API | Description | Key Features |
|-----|-------------|-------------|
| **download-file** | Download a file triggered by a button click | Uses `downloadFile()` helper to handle browser downloads |
| **pagination** | Scrape data across paginated listings | Demonstrates iterating through pages and extracting structured data |
| **upload-to-s3** | Download a file and upload it to S3 in one step | Uses `saveFileToS3()` to seamlessly transfer files to cloud storage |
| **capture-screenshots** | Capture a screenshot and upload it to S3 | Uses `uploadFileToS3()` to save screenshots with custom filenames |

## Project Structure

```
typescript-examples/quick-recipes/
├── api/
│   ├── download-file.ts       # File download example
│   ├── pagination.ts          # Pagination scraping example
│   ├── upload-to-s3.ts        # S3 upload example
│   └── capture-screenshots.ts # Screenshot capture example
├── .parameters/
│   ├── download-file/
│   │   └── default.json       # Empty parameters
│   ├── pagination/
│   │   └── default.json       # maxPages parameter
│   ├── upload-to-s3/
│   │   └── default.json       # Empty parameters
│   └── capture-screenshots/
│       └── default.json       # Empty parameters
├── Intuned.jsonc              # Project configuration
├── package.json
├── tsconfig.json
└── .env.example
```

## How Each Recipe Works

### Download File

Downloads a PDF file from a sample page by clicking a download button.

```typescript
// Navigate to page with downloadable files
await page.goto("https://sandbox.intuned.dev/pdfs");

// Click download button and wait for file
const downloadedFile = await downloadFile({
  page,
  trigger: downloadLocator,
  timeoutInMs: 15000,
});

// Get the filename
const fileName = downloadedFile.suggestedFilename();
```

**Learn more**: [Download File Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/download-file)

### Pagination

Extracts product data from an e-commerce site across multiple pages.

```typescript
// Navigate to first page
await page.goto("https://www.scrapingcourse.com/pagination");

// Loop through pages
while (currentPage < maxPages) {
  // Extract data from current page
  const results = await extractDataFromCurrentPage(page);
  allProducts.push(...results);

  // Check if next page exists
  if (!await hasNextPage(page)) break;

  // Navigate to next page
  await goToNextPage(page);
}
```

**Learn more**: [Pagination Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/pagination)

### Upload to S3

Downloads a file and directly uploads it to S3 storage in a single operation.

```typescript
// Download and upload to S3 in one step
const uploadedFile = await saveFileToS3({
  page,
  trigger: downloadLocator,
  timeoutInMs: 15000,
});

// Get signed URL for access
const signedUrl = await uploadedFile.getSignedUrl();
```

**Learn more**: [Upload to S3 Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/upload-to-s3)

### Capture Screenshots

Captures a screenshot of a webpage and uploads it to S3.

```typescript
// Navigate to page
await page.goto("https://www.example.com");

// Capture screenshot as bytes
const screenshotInBytes = await page.screenshot();

// Upload to S3 with custom filename
const uploadedFile = await uploadFileToS3({
  file: screenshotInBytes,
  fileNameOverride: "screenshot.png",
  contentType: "image/png",
});

// Get signed URL
const signedUrl = await uploadedFile.getSignedUrl();
```

**Learn more**: [Capture Screenshots Recipe](https://docs.intunedhq.com/docs/01-learn/recipes/capture-screenshots)

## Environment Variables

Create a `.env` file in the project root (don't commit to version control):

```bash
INTUNED_API_KEY=your_api_key_here
```

Get your API key from the [Intuned Dashboard](https://app.intunedhq.com/).

## Common Use Cases

- **File Downloads**: Automate downloading reports, invoices, or documents from web applications
- **Data Extraction**: Scrape product listings, prices, or other structured data with pagination
- **Cloud Storage**: Automatically save downloaded files or screenshots to S3 for archival or processing
- **Visual Monitoring**: Capture screenshots of dashboards or pages for monitoring changes

## Dependencies

- `@intuned/browser` - Intuned helper functions for browser automation
- `playwright` - Browser automation framework
- `typescript` - Type-safe development

## Resources

- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview)
- [Quick Recipes Documentation](https://docs.intunedhq.com/docs/01-learn/recipes/)
- [TypeScript SDK Reference](https://docs.intunedhq.com/automation-sdks/intuned-sdk/typescript/helpers/functions/)
- [Playwright Documentation](https://playwright.dev/)
