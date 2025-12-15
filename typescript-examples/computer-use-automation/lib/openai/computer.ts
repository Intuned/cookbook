import sharp from 'sharp';
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
    const buf = await this._page.screenshot({ fullPage: false, type: 'png' });
    const webp = await sharp(buf).webp().toBuffer();
    return webp.toString('base64');
  };

  click = async (
    button: 'left' | 'right' | 'back' | 'forward' | 'wheel',
    x: number,
    y: number,
  ): Promise<void> => {
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
        // Wait for any navigation or page changes
        await this._page.waitForTimeout(1500);
        return;
      }
    }
  };

  doubleClick = async (x: number, y: number): Promise<void> => {
    console.log(`Double click at (${x}, ${y})`);
    await this._page.mouse.dblclick(x, y);
    await this._page.waitForTimeout(1500);
  };

  scroll = async (x: number, y: number, scrollX: number, scrollY: number): Promise<void> => {
    console.log(`Scroll at (${x}, ${y}) by (${scrollX}, ${scrollY})`);
    await this._page.mouse.move(x, y);
    await this._page.evaluate(
      (params: { dx: number; dy: number }) => window.scrollBy(params.dx, params.dy),
      { dx: scrollX, dy: scrollY },
    );
  };

  type = async (text: string): Promise<void> => {
    console.log(`Typing: ${text}`);
    await this._page.keyboard.type(text);
  };

  keypress = async (keys: string[]): Promise<void> => {
    console.log(`Keypress: ${keys.join('+')}`);
    const mapped = keys.map((k) => KEY_MAP[k.toLowerCase()] ?? k);
    for (const k of mapped) await this._page.keyboard.down(k);
    for (const k of [...mapped].reverse()) await this._page.keyboard.up(k);
  };

  wait = async (ms = 1000): Promise<void> => {
    console.log(`Waiting ${ms}ms`);
    await new Promise((resolve) => setTimeout(resolve, ms));
  };

  move = async (x: number, y: number): Promise<void> => {
    await this._page.mouse.move(x, y);
  };

  drag = async (path: Point[]): Promise<void> => {
    const first = path[0];
    if (!first) return;
    console.log(`Dragging from (${first.x}, ${first.y}) through ${path.length} points`);
    await this._page.mouse.move(first.x, first.y);
    await this._page.mouse.down();
    for (const pt of path.slice(1)) await this._page.mouse.move(pt.x, pt.y);
    await this._page.mouse.up();
  };

  goto = async (url: string): Promise<void> => {
    console.log(`Navigating to: ${url}`);
    try {
      await goToUrl({ page: this._page, url });
      await this._page.waitForTimeout(2000);
      console.log(`Successfully navigated to: ${url}`);
    } catch (error) {
      console.error(`Error navigating to ${url}:`, error);
      throw error;
    }
  };

  back = async (): Promise<void> => {
    console.log('Navigating back');
    try {
      await this._page.goBack({ waitUntil: 'networkidle', timeout: 30000 });
      await this._page.waitForTimeout(2000);
    } catch (error) {
      console.log('Cannot go back - no previous page in history');
    }
  };

  forward = async (): Promise<void> => {
    console.log('Navigating forward');
    try {
      await this._page.goForward({ waitUntil: 'networkidle', timeout: 30000 });
      await this._page.waitForTimeout(2000);
    } catch (error) {
      console.log('Cannot go forward - no forward page in history');
    }
  };
}

