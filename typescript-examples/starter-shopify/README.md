# starter-shopify (TypeScript)

Minimal starter showing how to scrape products from any Shopify storefront using the public `products.json` endpoint.

<!-- IDE-IGNORE-START -->
<a href="https://app.intuned.io?repo=https://github.com/Intuned/cookbook/tree/main/typescript-examples/starter-shopify" target="_blank" rel="noreferrer"><img src="https://cdn1.intuned.io/button.svg" alt="Run on Intuned"></a>
<!-- IDE-IGNORE-END -->

## APIs

| API | Description |
| --- | ----------- |
| `shopify-list` | Paginates the public `/products.json` endpoint of a Shopify store and returns product metadata |

<!-- IDE-IGNORE-START -->
## Getting Started

### Install dependencies

```bash
npm install
# or
yarn
```

If the `intuned` CLI is not installed, install it globally:

```bash
npm install -g @intuned/cli
```

### Run an API

```bash
intuned dev run api shopify-list .parameters/api/shopify-list/default.json
```

### Save project

```bash
intuned dev provision
```

### Deploy

```bash
intuned dev deploy
```
<!-- IDE-IGNORE-END -->

## Project Structure

```
starter-shopify/
├── api/
│   └── shopify-list.ts                    # Lists products from a Shopify store
├── intuned-resources/
│   └── jobs/
│       └── shopify-list.job.jsonc
├── .parameters/
│   └── api/
│       └── shopify-list/
│           └── default.json
├── Intuned.jsonc
├── package.json
└── README.md
```

## Related

- [Intuned CLI](https://intunedhq.com/docs/main/05-references/cli/overview)
- [Intuned Browser SDK](https://intunedhq.com/docs/automation-sdks/overview)
- [Intuned llm.txt](https://intunedhq.com/docs/llms.txt)
