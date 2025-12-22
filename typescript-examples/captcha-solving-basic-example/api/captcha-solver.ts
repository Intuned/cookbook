import { BrowserContext, Page } from "playwright";
import { waitForCaptchaSolve } from "@intuned/runtime";
import { goToWithCaptchaSolve } from "../helpers/captcha";
interface Params {}

export async function cloudflareChallenge(
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

  await waitForCaptchaSolve(page, {
    timeoutInMs: 30_000,
    settleDurationMs: 10_000,
  });
  return {};
}

export async function cloudflareTurnstile(
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
  await goToWithCaptchaSolve(
    page,
    "https://2captcha.com/demo/cloudflare-turnstile"
  );
  return {};
}

export async function customCaptcha(page: Page, params?: Params): Promise<{}> {
  /**
   * Solve custom captcha
   *
   * Configuration (Intuned.json):
   *   captchaSolver.enabled: true
   *   captchaSolver.customCaptcha.enabled: true
   *   captchaSolver.settings: { autoSolve, maxRetries }
   */

  await goToWithCaptchaSolve(
    page,
    "https://captcha.com/demos/features/captcha-demo.aspx"
  );
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

  await goToWithCaptchaSolve(
    page,
    "https://test.cap.guru/demo/geetest#geetest2"
  );
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

  await goToWithCaptchaSolve(
    page,
    "https://2captcha.com/demo/recaptcha-v2-enterprise"
  );
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
  await customCaptcha(page, params);
  await page.waitForTimeout(5000);

  await geetest(page, params);
  await page.waitForTimeout(5000);

  await recaptcha(page, params);
  await page.waitForTimeout(5000);

  await cloudflareChallenge(page, params);
  await page.waitForTimeout(5000);

  await cloudflareTurnstile(page, params);

  return {};
}
