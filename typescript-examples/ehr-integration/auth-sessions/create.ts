import { BrowserContext, Page } from "playwright";

interface Params {
  username: string;
  password: string;
}

export default async function create(
  params: Params,
  _playwrightPage: Page,
  context: BrowserContext
): Promise<void> {
  const page = _playwrightPage;
  // Step 1: Navigate to the login page
  // Wait for the page to fully load before proceeding
  await page.goto("https://demo.openimis.org/front/login", {
    waitUntil: "networkidle",
    timeout: 30_000,
  });

  // Step 2: Find the username input field and enter the username

  const usernameInput = page.locator("input[type='text']");
  await usernameInput.fill(params.username);

  // Step 3: Find the password input field and enter the password

  const passwordInput = page.locator("input[type='password']");
  await passwordInput.fill(params.password);

  // Step 4: Click the button to log in
  // This will submit the login form with the credentials we just entered
  const submitButton = page.locator("button[type=submit]");
  await submitButton.click();

  // Step 5: Wait for the page to load after login
  // We wait for the network to be idle, indicating the page has finished loading
  await page.waitForLoadState("networkidle");

  // Step 6: Verify successful login by checking if welcome message is visible
  // If the user menu toggle is not visible, waitFor will raise an exception
  const userMenuToggle = page.locator("h4.MuiTypography-h4");
  await userMenuToggle.waitFor({ state: "visible", timeout: 10_000 });

  // Step 7: Add a brief delay to ensure session is fully established
  // This helps prevent race conditions where the session might not be fully saved
  await page.waitForTimeout(2000);
}
