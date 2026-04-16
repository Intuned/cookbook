import { BrowserContext, Page } from "playwright";

/**
 * Fill Form
 *
 * Demonstrates multi-step form interactions on a 3-step checkout form:
 * - Step 1: Shipping address (text inputs, dropdown, checkbox)
 * - Step 2: Payment details (text inputs, checkbox)
 * - Step 3: Review and complete order
 */

interface Params {
  firstName: string;
  lastName: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
}

export default async function handler(
  params: Params,
  page: Page,
  _context: BrowserContext
) {
  const firstName = params.firstName ?? "John";
  const lastName = params.lastName ?? "Doe";
  const addressLine1 = params.addressLine1 ?? "123 Main St";
  const city = params.city ?? "Springfield";
  const state = params.state ?? "IL";
  const zipCode = params.zipCode ?? "62701";

  await page.goto("https://sandbox.intuned.dev/steps-form/ShippingAddress");
  await page.waitForLoadState("load");

  // Step 1: Shipping Address — type slowly to simulate human input
  await page.getByLabel("First Name").pressSequentially(firstName, { delay: 80 });
  await page.getByLabel("Last Name").pressSequentially(lastName, { delay: 80 });
  await page.getByLabel("Address Line1").pressSequentially(addressLine1, { delay: 80 });
  await page.getByLabel("Address Line2").pressSequentially("Apt 4B", { delay: 80 });
  await page.getByLabel("City").pressSequentially(city, { delay: 80 });
  await page.getByLabel("State").pressSequentially(state, { delay: 80 });
  await page.getByLabel("Zip Code").pressSequentially(zipCode, { delay: 80 });

  // Select country from dropdown
  await page.getByLabel("Country").selectOption({ label: "United States" });

  // Check "Use for future purchase"
  const useForFuture = page.getByLabel("Use for future purchase.");
  if (!(await useForFuture.isChecked())) {
    await useForFuture.check();
  }

  await page.getByRole("button", { name: "Next" }).click();
  await page.waitForLoadState("load");

  // Step 2: Payment Details — type slowly to simulate human input
  await page.getByLabel("Name On Card").pressSequentially(`${firstName} ${lastName}`, { delay: 80 });
  await page.getByLabel("Card Number").pressSequentially("4111111111111111", { delay: 80 });
  await page.getByLabel("Expiry Date").pressSequentially("12/28", { delay: 80 });
  await page.getByLabel("Cvv").pressSequentially("123", { delay: 80 });

  // Check "Remember Credit Card Details"
  const rememberCard = page.getByLabel("Remember Credit Card Details");
  if (!(await rememberCard.isChecked())) {
    await rememberCard.check();
  }

  await page.getByRole("button", { name: "Next" }).click();
  await page.waitForLoadState("load");

  // Step 3: Review order and complete
  const completeOrderBtn = page.getByRole("button", { name: "Complete Order" });
  await completeOrderBtn.waitFor({ state: "visible" });
  await completeOrderBtn.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);

  return {
    message: "Multi-step form completed successfully",
    results: {
      shippingAddress: {
        firstName,
        lastName,
        addressLine1,
        addressLine2: "Apt 4B",
        city,
        state,
        zipCode,
        country: "United States",
      },
      paymentDetails: {
        nameOnCard: `${firstName} ${lastName}`,
        cardNumber: "**** **** **** 1111",
        expiryDate: "12/28",
      },
    },
  };
}
