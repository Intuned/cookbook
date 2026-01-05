import { BrowserContext, Page } from "playwright";

/**
 * Fill Form
 *
 * Demonstrates form interactions:
 * - Text input fields
 * - Dropdown selects
 * - Checkboxes and radio buttons
 */

interface Params {
  firstName: string;
  lastName: string;
  email: string;
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Using the-internet for reliable form demonstration
  await page.goto("https://the-internet.herokuapp.com/login");
  await page.waitForLoadState("load");

  // Fill text inputs using different locator strategies
  // By ID
  await page.locator("#username").fill(params.firstName);

  // By name attribute
  await page.locator('input[name="password"]').fill("SuperSecretPassword!");

  // Get values before any action
  const usernameValue = await page.locator("#username").inputValue();

  // Click button using text
  await page.getByRole("button", { name: "Login" }).click();

  // Wait for result
  await page.waitForLoadState("networkidle");

  // Check if we got an error message (expected since credentials are fake)
  const flashMessage = await page.locator("#flash").textContent();

  // Navigate to dropdown page for select demonstration
  await page.goto("https://the-internet.herokuapp.com/dropdown");
  await page.waitForLoadState("load");

  // Select dropdown option by value
  const dropdown = page.locator("#dropdown");
  await dropdown.selectOption("1");
  const selectedValue = await dropdown.inputValue();

  // Select by label text
  await dropdown.selectOption({ label: "Option 2" });
  const selectedLabel = await dropdown.inputValue();

  // Navigate to checkboxes page
  await page.goto("https://the-internet.herokuapp.com/checkboxes");
  await page.waitForLoadState("load");

  // Work with checkboxes
  const checkboxes = page.locator('input[type="checkbox"]');

  // Check first checkbox if not checked
  const firstCheckbox = checkboxes.nth(0);
  if (!(await firstCheckbox.isChecked())) {
    await firstCheckbox.check();
  }

  // Uncheck second checkbox if checked
  const secondCheckbox = checkboxes.nth(1);
  if (await secondCheckbox.isChecked()) {
    await secondCheckbox.uncheck();
  }

  const checkbox1Checked = await firstCheckbox.isChecked();
  const checkbox2Checked = await secondCheckbox.isChecked();

  return {
    message: "Form interactions completed",
    results: {
      loginAttempt: {
        username: usernameValue,
        result: flashMessage?.trim(),
      },
      dropdown: {
        selectedByValue: selectedValue,
        selectedByLabel: selectedLabel,
      },
      checkboxes: {
        first: checkbox1Checked,
        second: checkbox2Checked,
      },
    },
  };
}
