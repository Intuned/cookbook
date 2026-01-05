"""
Page Evaluate

Demonstrates executing JavaScript in the browser context:
- Running custom JavaScript
- Accessing DOM directly
- Extracting complex data
- Manipulating the page
"""

from typing import TypedDict

from playwright.async_api import Page


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    await page.goto("https://books.toscrape.com/")
    await page.wait_for_load_state("networkidle")

    # Simple evaluate - scroll to bottom
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

    # Get page dimensions
    dimensions = await page.evaluate("""() => {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            scrollHeight: document.body.scrollHeight
        }
    }""")

    # Extract data using JavaScript
    product_data = await page.evaluate("""() => {
        const products = Array.from(document.querySelectorAll('.product_pod'));
        return products.slice(0, 5).map(product => {
            const titleEl = product.querySelector('h3 a');
            const priceEl = product.querySelector('.price_color');
            return {
                title: titleEl ? titleEl.getAttribute('title') : null,
                price: priceEl ? priceEl.textContent : null
            };
        });
    }""")

    # Pass arguments to evaluate
    greeting = await page.evaluate(
        "(name) => `Hello, ${name}! Current URL is ${window.location.href}`",
        "Playwright User"
    )

    # Manipulate DOM - hide all images
    await page.evaluate("""() => {
        document.querySelectorAll('img').forEach(img => {
            img.style.visibility = 'hidden';
        });
    }""")

    # Check if images are hidden
    first_image_visible = await page.locator("img").first.is_visible()

    # Restore images
    await page.evaluate("""() => {
        document.querySelectorAll('img').forEach(img => {
            img.style.visibility = 'visible';
        });
    }""")

    return {
        "dimensions": dimensions,
        "productData": product_data,
        "greeting": greeting,
        "imagesWereHidden": not first_image_visible,
    }
