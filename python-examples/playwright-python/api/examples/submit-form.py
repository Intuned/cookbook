from playwright.async_api import Page, Locator
from typing import TypedDict


class Params(TypedDict):
    first_name: str
    last_name: str
    address1: str
    address2: str
    city: str
    state: str
    zip_code: str
    country: str
    name_on_card: str
    card_number: str
    expiration: str
    cvv: str
    save_address: bool
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    await page.goto("https://sandbox.intuned.dev/steps-form/ShippingAddress")
    await page.wait_for_load_state("load")
    """
    Step 1
    """
    # text fields
    await page.get_by_label("First Name *").fill(params.get("first_name"))
    await page.locator("[name='lastName']").fill(params.get("last_name"))
    await page.locator("[name='addressLine1']").fill(params.get("address1"))
    await page.locator("[name='addressLine2']").fill(params.get("address2"))
    await page.locator("[name='city']").fill(params.get("city"))
    await page.locator("[name='state']").fill(params.get("state"))
    await page.locator("[name='zipCode']").fill(params.get("zip_code"))

    # select field
    await page.locator("[name='country']").select_option(params.get("country"))

    # checkbox
    await page.locator("[name='futurePurchase']").check()

    # submit
    await page.get_by_role("button", name="Next").click()

    """
    Step 2
    """
    # text fields
    await page.locator("[name='nameOnCard']").fill(params.get("name_on_card"))
    await page.locator("[name='cardNumber']").fill(params.get("card_number"))
    await page.locator("[name='expiryDate']").fill(params.get("expiration"))
    await page.locator("[name='cvv']").fill(params.get("cvv"))

    # checkbox
    await page.locator("[name='rememberCreditCardDetails']").check()

    # submit
    await page.get_by_role("button", name="Next").click()

    # get total price text
    text = await page.locator("p", has_text="Total Price").text_content()
    return text
