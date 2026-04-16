"""
Fill Form

Demonstrates multi-step form interactions on a 3-step checkout form:
- Step 1: Shipping address (text inputs, dropdown, checkbox)
- Step 2: Payment details (text inputs, checkbox)
- Step 3: Review and complete order
"""

from typing import TypedDict

from playwright.async_api import Page


class Params(TypedDict):
    firstName: str
    lastName: str
    addressLine1: str
    city: str
    state: str
    zipCode: str


async def automation(page: Page, params: Params | None = None, **_kwargs):
    first_name = params.get("firstName", "John") if params else "John"
    last_name = params.get("lastName", "Doe") if params else "Doe"
    address_line1 = (
        params.get("addressLine1", "123 Main St") if params else "123 Main St"
    )
    city = params.get("city", "Springfield") if params else "Springfield"
    state = params.get("state", "IL") if params else "IL"
    zip_code = params.get("zipCode", "62701") if params else "62701"

    await page.goto("https://sandbox.intuned.dev/steps-form/ShippingAddress")
    await page.wait_for_load_state("load")

    # Step 1: Shipping Address — type slowly to simulate human input
    await page.get_by_label("First Name").press_sequentially(first_name, delay=80)
    await page.get_by_label("Last Name").press_sequentially(last_name, delay=80)
    await page.get_by_label("Address Line1").press_sequentially(address_line1, delay=80)
    await page.get_by_label("Address Line2").press_sequentially("Apt 4B", delay=80)
    await page.get_by_label("City").press_sequentially(city, delay=80)
    await page.get_by_label("State").press_sequentially(state, delay=80)
    await page.get_by_label("Zip Code").press_sequentially(zip_code, delay=80)

    # Select country from dropdown
    await page.get_by_label("Country").select_option(label="United States")

    # Check "Use for future purchase"
    use_for_future = page.get_by_label("Use for future purchase.")
    if not await use_for_future.is_checked():
        await use_for_future.check()

    await page.get_by_role("button", name="Next").click()
    await page.wait_for_load_state("load")

    # Step 2: Payment Details — type slowly to simulate human input
    await page.get_by_label("Name On Card").press_sequentially(
        f"{first_name} {last_name}", delay=80
    )
    await page.get_by_label("Card Number").press_sequentially(
        "4111111111111111", delay=80
    )
    await page.get_by_label("Expiry Date").press_sequentially("12/28", delay=80)
    await page.get_by_label("Cvv").press_sequentially("123", delay=80)

    # Check "Remember Credit Card Details"
    remember_card = page.get_by_label("Remember Credit Card Details")
    if not await remember_card.is_checked():
        await remember_card.check()

    await page.get_by_role("button", name="Next").click()
    await page.wait_for_load_state("load")

    # Step 3: Review order and complete
    complete_order_btn = page.get_by_role("button", name="Complete Order")
    await complete_order_btn.wait_for(state="visible")
    await complete_order_btn.click()
    await page.wait_for_timeout(3000)

    return {
        "message": "Multi-step form completed successfully",
        "results": {
            "shippingAddress": {
                "firstName": first_name,
                "lastName": last_name,
                "addressLine1": address_line1,
                "addressLine2": "Apt 4B",
                "city": city,
                "state": state,
                "zipCode": zip_code,
                "country": "United States",
            },
            "paymentDetails": {
                "nameOnCard": f"{first_name} {last_name}",
                "cardNumber": "**** **** **** 1111",
                "expiryDate": "12/28",
            },
        },
    }
