import { BrowserContext, Page } from "playwright";

interface Params {}

export async function cloudflare_challenge(
  page: Page,
  params?: Params
): Promise<{}> {
  /**
   * Solve Cloudflare challenge captcha with callable pattern
   *
   * Configuration (Intuned.json):
   *   captchaSolver.enabled: true
   *   captchaSolver.cloudflare.enabled: true
   *   captchaSolver.settings: { autoSolve, maxRetries }
   */
  await page.goto("https://2captcha.com/demo/cloudflare-turnstile-challenge");

  await page.waitForTimeout(3000); // Wait until the captcha is solved

  return {};
}

export async function cloudflare_turnstile(
  page: Page,
  params?: Params
): Promise<{}> {
  /**
   * Solve Cloudflare Turnstile captcha with decorator pattern
   *
   * Configuration (Intuned.json):
   *   captchaSolver.enabled: true
   *   captchaSolver.cloudflare.enabled: true
   *   captchaSolver.settings: { autoSolve, maxRetries }
   */
  await page.goto("https://2captcha.com/demo/cloudflare-turnstile");
  await page.waitForTimeout(3000); // Wait until the captcha is solved
  return {};
}

export async function custom_captcha(page: Page, params?: Params): Promise<{}> {
  /**
   * Solve custom captcha
   *
   * Configuration (Intuned.json):
   *   captchaSolver.enabled: true
   *   captchaSolver.customCaptcha.enabled: true
   *   captchaSolver.settings: { autoSolve, maxRetries }
   */

  await page.goto("https://captcha.com/demos/features/captcha-demo.aspx");
  await page.waitForTimeout(3000); // Wait until the captcha is solved
  return {};
}

export async function geetest(page: Page, params?: Params): Promise<{}> {
  /**
   * Solve GeeTest captcha
   *
   * Configuration (Intuned.json):
   *   captchaSolver.enabled: true
   *   captchaSolver.geetest.enabled: true
   *   captchaSolver.settings: { autoSolve, maxRetries }
   */

  await page.goto("https://test.cap.guru/demo/geetest#geetest2");
  await page.waitForTimeout(3000); // Wait until the captcha is solved

  return {};
}

export async function recaptcha(page: Page, params?: Params): Promise<{}> {
  /**
   * Solve reCAPTCHA v2 Enterprise
   *
   * Configuration (Intuned.json):
   *   captchaSolver.enabled: true
   *   captchaSolver.googleRecaptchaV2.enabled: true
   *   captchaSolver.settings: { autoSolve, maxRetries }
   */

  await page.goto("https://2captcha.com/demo/recaptcha-v2-enterprise");
  await page.waitForTimeout(3000); // Wait until the captcha is solved
  return {};
}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
): Promise<{}> {
  /**
   * Automation wrapper that calls all captcha solvers with 5 second intervals
   *
   * Configuration (Intuned.json):
   *   Core settings:
   *     captchaSolver.enabled: true
   *     captchaSolver.settings: { autoSolve, maxRetries }
   *
   *   Individual solver settings:
   *     captchaSolver.customCaptcha.enabled: true
   *     captchaSolver.geetest.enabled: true
   *     captchaSolver.googleRecaptchaV2.enabled: true
   *     captchaSolver.cloudflare.enabled: true
   */
  await custom_captcha(page, params);
  await page.waitForTimeout(5000);

  await geetest(page, params);
  await page.waitForTimeout(5000);

  await recaptcha(page, params);
  await page.waitForTimeout(5000);

  await cloudflare_challenge(page, params);
  await page.waitForTimeout(5000);

  await cloudflare_turnstile(page, params);

  return {};
}
