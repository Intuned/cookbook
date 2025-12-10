# Intuned Cookbook

A collection of templates and recipes for building browser automations with [Intuned](https://intunedhq.com).

## What's Inside

### 📁 Templates

Complete, ready-to-deploy Intuned projects that you can use as starting points for your own automations.

| Template | Description |
|----------|-------------|
| [book-consultations](./templates/book-consultations/) | Booking automation to book consultations and list bookings |
| [book-consultations-auth](./templates/book-consultations-auth/) | Authenticated booking automation with session management |

Each template includes both **TypeScript** and **Python** implementations.

### 📝 Recipes

Quick code snippets demonstrating common browser automation patterns.

| Recipe | Description |
|--------|-------------|
| [download-file](./recipes/download-file/) | Download files triggered by button clicks or links |
| [pagination](./recipes/pagination/) | Scrape data across multiple pages |
| [upload-to-s3](./recipes/upload-to-s3/) | Upload downloaded files or screenshots to S3 |
| [capture-screenshots](./recipes/capture-screenshots/) | Take page screenshots and save them |

Each recipe includes both **TypeScript** and **Python** implementations.

## Getting Started

### Using a Template

1. Copy the template folder to your project
2. Choose your language (TypeScript or Python)
3. Install dependencies:
   ```bash
   # TypeScript
   yarn install
   
   # Python
   uv sync  # or poetry install
   ```
4. Run locally with the Intuned CLI:
   ```bash
   # TypeScript
   yarn intuned run api <api-name> <parameters>
   
   # Python
   uv run intuned run api <api-name> <parameters>
   ```

### Using a Recipe

Copy the code snippet from any recipe into your Intuned project's `api/` folder.

## Learn More

- [Intuned Documentation](https://docs.intunedhq.com/docs/00-getting-started/introduction)
- [Intuned Browser SDK](https://docs.intunedhq.com/automation-sdks/intuned-sdk/overview)
- [Intuned in Depth](https://docs.intunedhq.com/docs/01-learn/deep-dives/intuned-indepth)
- [AuthSessions](https://docs.intunedhq.com/docs/02-features/auth-sessions)

## Contributing

Contributions are welcome! Please follow the patterns established in the existing templates and recipes.

