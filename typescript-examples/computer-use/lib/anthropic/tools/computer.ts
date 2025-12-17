import type { Page } from 'playwright';
import { Action, ToolError } from '../types/computer';
import type { ActionParams, BaseAnthropicTool, ToolResult } from '../types/computer';
import { KeyboardUtils } from './utils/keyboard';
import { ActionValidator } from './utils/validator';

const TYPING_DELAY_MS = 12;

export class ComputerTool implements BaseAnthropicTool {
  name: 'computer' = 'computer';
  protected page: Page;
  protected _screenshotDelay = 2.0;
  protected version: '20241022' | '20250124';

  private readonly mouseActions = new Set([
    Action.LEFT_CLICK,
    Action.RIGHT_CLICK,
    Action.MIDDLE_CLICK,
    Action.DOUBLE_CLICK,
    Action.TRIPLE_CLICK,
    Action.MOUSE_MOVE,
    Action.LEFT_CLICK_DRAG,
    Action.LEFT_MOUSE_DOWN,
    Action.LEFT_MOUSE_UP,
  ]);

  private readonly keyboardActions = new Set([
    Action.KEY,
    Action.TYPE,
    Action.HOLD_KEY,
  ]);

  private readonly systemActions = new Set([
    Action.SCREENSHOT,
    Action.CURSOR_POSITION,
    Action.SCROLL,
    Action.WAIT,
  ]);

  constructor(page: Page, version: '20241022' | '20250124' = '20250124') {
    this.page = page;
    this.version = version;
  }

  get apiType(): 'computer_20241022' | 'computer_20250124' {
    return this.version === '20241022' ? 'computer_20241022' : 'computer_20250124';
  }

  toParams(): any {
    const params = {
      name: this.name,
      type: this.apiType,
      display_width_px: 1280,
      display_height_px: 720,
      display_number: null,
    };
    return params;
  }

  private getMouseButton(action: Action): 'left' | 'right' | 'middle' {
    switch (action) {
      case Action.LEFT_CLICK:
      case Action.DOUBLE_CLICK:
      case Action.TRIPLE_CLICK:
      case Action.LEFT_CLICK_DRAG:
      case Action.LEFT_MOUSE_DOWN:
      case Action.LEFT_MOUSE_UP:
        return 'left';
      case Action.RIGHT_CLICK:
        return 'right';
      case Action.MIDDLE_CLICK:
        return 'middle';
      default:
        throw new ToolError(`Invalid mouse action: ${action}`);
    }
  }

  private async handleMouseAction(action: Action, coordinate: [number, number]): Promise<ToolResult> {
    const [x, y] = ActionValidator.validateAndGetCoordinates(coordinate);
    console.log(`Mouse action: ${action} at coordinates (${x}, ${y})`);
    
    await this.page.mouse.move(x, y);
    await this.page.waitForTimeout(100);

    if (action === Action.LEFT_MOUSE_DOWN) {
      await this.page.mouse.down();
    } else if (action === Action.LEFT_MOUSE_UP) {
      await this.page.mouse.up();
    } else {
      const button = this.getMouseButton(action);
      if (action === Action.DOUBLE_CLICK) {
        await this.page.mouse.dblclick(x, y, { button });
      } else if (action === Action.TRIPLE_CLICK) {
        await this.page.mouse.click(x, y, { button, clickCount: 3 });
      } else {
        await this.page.mouse.click(x, y, { button });
      }
    }

    // Wait longer for any navigation or page changes
    await this.page.waitForTimeout(2000);
    return await this.screenshot();
  }

  private async handleKeyboardAction(action: Action, text: string, duration?: number): Promise<ToolResult> {
    if (action === Action.HOLD_KEY) {
      const key = KeyboardUtils.getPlaywrightKey(text);
      await this.page.keyboard.down(key);
      await new Promise(resolve => setTimeout(resolve, duration! * 1000));
      await this.page.keyboard.up(key);
    } else if (action === Action.KEY) {
      const keys = KeyboardUtils.parseKeyCombination(text);
      for (const key of keys) {
        await this.page.keyboard.down(key);
      }
      for (const key of keys.reverse()) {
        await this.page.keyboard.up(key);
      }
    } else {
      await this.page.keyboard.type(text, { delay: TYPING_DELAY_MS });
    }

    await this.page.waitForTimeout(500);
    return await this.screenshot();
  }

  async screenshot(): Promise<ToolResult> {
    try {
      console.log('Starting screenshot...');
      await new Promise(resolve => setTimeout(resolve, this._screenshotDelay * 1000));
      const screenshot = await this.page.screenshot({ type: 'png' });
      console.log('Screenshot taken, size:', screenshot.length, 'bytes');

      return {
        base64Image: screenshot.toString('base64'),
      };
    } catch (error) {
      throw new ToolError(`Failed to take screenshot: ${error}`);
    }
  }

  async call(params: ActionParams): Promise<ToolResult> {
    const { 
      action, 
      text, 
      coordinate, 
      scrollDirection: scrollDirectionParam,
      scroll_amount,
      scrollAmount,
      duration,
      ...kwargs 
    } = params;

    ActionValidator.validateActionParams(params, this.mouseActions, this.keyboardActions);

    if (action === Action.SCREENSHOT) {
      return await this.screenshot();
    }

    if (action === Action.CURSOR_POSITION) {
      const position = await this.page.evaluate(() => {
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        return rect ? { x: rect.x, y: rect.y } : null;
      });
      
      if (!position) {
        throw new ToolError('Failed to get cursor position');
      }
      
      return { output: `X=${position.x},Y=${position.y}` };
    }

    if (action === Action.SCROLL) {
      if (this.version !== '20250124') {
        throw new ToolError(`${action} is only available in version 20250124`);
      }

      const scrollDirection = (scrollDirectionParam || kwargs.scroll_direction) as string;
      const scrollAmountValue = scrollAmount || scroll_amount;

      if (!scrollDirection || !['up', 'down', 'left', 'right'].includes(scrollDirection)) {
        throw new ToolError(`Scroll direction "${scrollDirection}" must be 'up', 'down', 'left', or 'right'`);
      }
      if (typeof scrollAmountValue !== 'number' || scrollAmountValue < 0) {
        throw new ToolError(`Scroll amount "${scrollAmountValue}" must be a non-negative number`);
      }

      if (coordinate) {
        const [x, y] = ActionValidator.validateAndGetCoordinates(coordinate);
        await this.page.mouse.move(x, y);
        await this.page.waitForTimeout(100);
      }

      const pageDimensions = await this.page.evaluate(() => {
	      return { h: window.innerHeight, w: window.innerWidth };
      });
      const pagePartitions = 25;
      const scrollFactor = (scrollAmountValue || 10) / pagePartitions;
      
      if (scrollDirection === 'down' || scrollDirection === 'up') {
        const amount = pageDimensions.h * scrollFactor;
        console.log(`Scrolling ${amount.toFixed(2)} pixels ${scrollDirection}`);
        await this.page.mouse.wheel(0, scrollDirection === 'down' ? amount : -amount);
      } else {
        const amount = pageDimensions.w * scrollFactor;
        console.log(`Scrolling ${amount.toFixed(2)} pixels ${scrollDirection}`);
        await this.page.mouse.wheel(scrollDirection === 'right' ? amount : -amount, 0);
      }
      
      await this.page.waitForTimeout(500);
      return await this.screenshot();
    }

    if (action === Action.WAIT) {
      if (this.version !== '20250124') {
        throw new ToolError(`${action} is only available in version 20250124`);
      }
      await new Promise(resolve => setTimeout(resolve, duration! * 1000));
      return await this.screenshot();
    }

    if (this.mouseActions.has(action)) {
      if (!coordinate) {
        throw new ToolError(`coordinate is required for ${action}`);
      }
      return await this.handleMouseAction(action, coordinate);
    }

    if (this.keyboardActions.has(action)) {
      if (!text) {
        throw new ToolError(`text is required for ${action}`);
      }
      return await this.handleKeyboardAction(action, text, duration);
    }

    throw new ToolError(`Invalid action: ${action}`);
  }
}

// For backward compatibility
export class ComputerTool20241022 extends ComputerTool {
  constructor(page: Page) {
    super(page, '20241022');
  }
}

export class ComputerTool20250124 extends ComputerTool {
  constructor(page: Page) {
    super(page, '20250124');
  }
}

