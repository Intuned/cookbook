import { BrowserContext, Page } from "playwright";

interface Params {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  nameOnCard: string;
  cardNumber: string;
  expiration: string;
  cvv: string;
  saveAddress: boolean;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  await page.goto("https://sandbox.intuned.dev/steps-form/ShippingAddress");
  await page.waitForLoadState("load");

  // Step 1: Shipping Address
  await page.getByLabel("First Name *").fill(params.firstName);
  await page.locator("[name='lastName']").fill(params.lastName);
  await page.locator("[name='addressLine1']").fill(params.address1);
  await page.locator("[name='addressLine2']").fill(params.address2);
  await page.locator("[name='city']").fill(params.city);
  await page.locator("[name='state']").fill(params.state);
  await page.locator("[name='zipCode']").fill(params.zipCode);
  await page.locator("[name='country']").selectOption(params.country);
  await page.locator("[name='futurePurchase']").check();
  await page.getByRole("button", { name: "Next" }).click();

  // Step 2: Payment Info
  await page.locator("[name='nameOnCard']").fill(params.nameOnCard);
  await page.locator("[name='cardNumber']").fill(params.cardNumber);
  await page.locator("[name='expiryDate']").fill(params.expiration);
  await page.locator("[name='cvv']").fill(params.cvv);
  await page.locator("[name='rememberCreditCardDetails']").check();
  await page.getByRole("button", { name: "Next" }).click();

  // Get total price
  const totalPrice = await page.locator("p", { hasText: "Total Price" }).textContent();
  return totalPrice;
}
