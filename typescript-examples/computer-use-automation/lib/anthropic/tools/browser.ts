import type { Page } from 'playwright';
import { ToolError } from '../types/computer';
import { goToUrl } from '@intuned/browser';

export interface BrowserToolResult {
  output?: string;
  error?: string;
  base64Image?: string;
}

export class BrowserTool {
  name: 'browser' = 'browser';
  protected page: Page;
  protected _screenshotDelay = 2.0;

  constructor(page: Page) {
    this.page = page;
  }

  toParams(): any {
    return {
      name: this.name,
      type: 'custom',
      description: 'Browser navigation tool for controlling the web browser',
      input_schema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['go_to_url', 'go_back', 'go_forward', 'refresh'],
            description: 'The navigation action to perform',
          },
          url: {
            type: 'string',
            description: 'The URL to navigate to (required for go_to_url action)',
          },
        },
        required: ['action'],
      },
    };
  }

  async screenshot(): Promise<BrowserToolResult> {
    try {
      console.log('Browser tool: taking screenshot...');
      await new Promise(resolve => setTimeout(resolve, this._screenshotDelay * 1000));
      const screenshot = await this.page.screenshot({ type: 'png' });
      console.log('Browser tool: screenshot taken, size:', screenshot.length, 'bytes');
      return {
        base64Image: screenshot.toString('base64'),
      };
    } catch (error) {
      throw new ToolError(`Failed to take screenshot: ${error}`);
    }
  }

  async call(params: { action: string; url?: string }): Promise<BrowserToolResult> {
    const { action, url } = params;

    switch (action) {
      case 'go_to_url':
        if (!url) {
          throw new ToolError('url is required for go_to_url action');
        }
        console.log(`Navigating to URL: ${url}`);
        await goToUrl({ page: this.page, url });
        await this.page.waitForTimeout(2000);
        console.log(`Successfully navigated to: ${url}`);
        return await this.screenshot();

      case 'go_back':
        console.log('Navigating back');
        try {
          await this.page.goBack({ waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (error) {
          return {
            output: 'Cannot go back - no previous page in history',
          };
        }
        await this.page.waitForTimeout(1000);
        return await this.screenshot();

      case 'go_forward':
        console.log('Navigating forward');
        try {
          await this.page.goForward({ waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (error) {
          return {
            output: 'Cannot go forward - no forward page in history',
          };
        }
        await this.page.waitForTimeout(1000);
        return await this.screenshot();

      case 'refresh':
        console.log('Refreshing page');
        await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
        await this.page.waitForTimeout(1000);
        return await this.screenshot();

      default:
        throw new ToolError(`Unknown browser action: ${action}`);
    }
  }
}

