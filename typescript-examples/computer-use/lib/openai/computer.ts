import type { Page } from 'playwright';
import { goToUrl } from '@intuned/browser';

// CUA key -> Playwright key mapping
const KEY_MAP: Record<string, string> = {
  '/': '/',
  '\\': '\\',
  alt: 'Alt',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
  arrowup: 'ArrowUp',
  backspace: 'Backspace',
  capslock: 'CapsLock',
  cmd: 'Meta',
  ctrl: 'Control',
  delete: 'Delete',
  end: 'End',
  enter: 'Enter',
  esc: 'Escape',
  home: 'Home',
  insert: 'Insert',
  option: 'Alt',
  pagedown: 'PageDown',
  pageup: 'PageUp',
  shift: 'Shift',
  space: ' ',
  super: 'Meta',
  tab: 'Tab',
  win: 'Meta',
};

interface Point {
  x: number;
  y: number;
}

interface ClickArgs {
  x: number;
  y: number;
  button?: 'left' | 'right' | 'back' | 'forward' | 'wheel';
}

interface ScrollArgs {
  x: number;
  y: number;
  scroll_x: number;
  scroll_y: number;
}

interface TypeArgs {
  text: string;
}

interface KeypressArgs {
  keys: string[];
}

interface WaitArgs {
  ms?: number;
}

interface MoveArgs {
  x: number;
  y: number;
}

interface DragArgs {
  path: Point[];
}

interface GotoArgs {
  url: string;
}

export class PlaywrightComputer {
  protected _page: Page;

  constructor(page: Page) {
    this._page = page;
  }

  getEnvironment = (): 'windows' | 'mac' | 'linux' | 'ubuntu' | 'browser' => {
    return 'browser';
  };

  getDimensions = (): [number, number] => {
    return [1280, 720];
  };

  getCurrentUrl = (): string => {
    return this._page.url();
  };

  screenshot = async (): Promise<string> => {
    console.log('📸 Taking screenshot...');
    const buf = await this._page.screenshot({ fullPage: false });
    return buf.toString('base64');
  };

  click = async ({ x, y, button = 'left' }: ClickArgs): Promise<void> => {
    console.log(`Click: ${button} at (${x}, ${y})`);
    switch (button) {
      case 'back':
        await this.back();
        return;
      case 'forward':
        await this.forward();
        return;
      case 'wheel':
        await this._page.mouse.wheel(x, y);
        return;
      default: {
        const btn = button === 'right' ? 'right' : 'left';
        await this._page.mouse.click(x, y, { button: btn });
        return;
      }
    }
  };

  double_click = async ({ x, y }: MoveArgs): Promise<void> => {
    console.log(`Double click at (${x}, ${y})`);
    await this._page.mouse.dblclick(x, y);
  };

  scroll = async ({ x, y, scroll_x, scroll_y }: ScrollArgs): Promise<void> => {
    console.log(`Scroll at (${x}, ${y}) by (${scroll_x}, ${scroll_y})`);
    await this._page.mouse.move(x, y);
    await this._page.evaluate(
      (params: { dx: number; dy: number }) => window.scrollBy(params.dx, params.dy),
      { dx: scroll_x, dy: scroll_y },
    );
  };

  type = async ({ text }: TypeArgs): Promise<void> => {
    console.log(`Typing: ${text}`);
    await this._page.keyboard.type(text);
  };

  keypress = async ({ keys }: KeypressArgs): Promise<void> => {
    console.log(`Keypress: ${keys.join('+')}`);
    const mapped = keys.map((k) => KEY_MAP[k.toLowerCase()] ?? k);
    for (const k of mapped) await this._page.keyboard.down(k);
    for (const k of [...mapped].reverse()) await this._page.keyboard.up(k);
  };

  wait = async ({ ms = 1000 }: WaitArgs = {}): Promise<void> => {
    console.log(`Waiting ${ms}ms`);
    await new Promise((resolve) => setTimeout(resolve, ms));
  };

  move = async ({ x, y }: MoveArgs): Promise<void> => {
    await this._page.mouse.move(x, y);
  };

  drag = async ({ path }: DragArgs): Promise<void> => {
    const first = path[0];
    if (!first) return;
    console.log(`Dragging from (${first.x}, ${first.y}) through ${path.length} points`);
    await this._page.mouse.move(first.x, first.y);
    await this._page.mouse.down();
    for (const pt of path.slice(1)) await this._page.mouse.move(pt.x, pt.y);
    await this._page.mouse.up();
  };

  goto = async ({ url }: GotoArgs): Promise<void> => {
    console.log(`Navigating to: ${url}`);
    try {
      await goToUrl({ page: this._page, url });
      console.log(`Successfully navigated to: ${url}`);
    } catch (error) {
      console.error(`Error navigating to ${url}:`, error);
      throw error;
    }
  };

  back = async (): Promise<void> => {
    console.log('Navigating back');
    try {
      await this._page.goBack();
    } catch {
      console.log('Cannot go back - no previous page in history');
    }
  };

  forward = async (): Promise<void> => {
    console.log('Navigating forward');
    try {
      await this._page.goForward();
    } catch {
      console.log('Cannot go forward - no forward page in history');
    }
  };
}
