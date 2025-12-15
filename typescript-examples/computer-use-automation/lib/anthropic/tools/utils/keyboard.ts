export class KeyboardUtils {
  // Only map alternative names to standard Playwright modifier keys
  private static readonly modifierKeyMap: Record<string, string> = {
    'ctrl': 'Control',
    'alt': 'Alt',
    'cmd': 'Meta',
    'command': 'Meta',
    'win': 'Meta',
  };

  // Essential key mappings for Playwright compatibility
  private static readonly keyMap: Record<string, string> = {
    'return': 'Enter',
    'space': ' ',
    'left': 'ArrowLeft',
    'right': 'ArrowRight',
    'up': 'ArrowUp',
    'down': 'ArrowDown',
    'home': 'Home',
    'end': 'End',
    'pageup': 'PageUp',
    'page_up': 'PageUp',
    'pagedown': 'PageDown',
    'page_down': 'PageDown',
    'delete': 'Delete',
    'backspace': 'Backspace',
    'tab': 'Tab',
    'esc': 'Escape',
    'escape': 'Escape',
    'insert': 'Insert',
    'super_l': 'Meta',
    'f1': 'F1',
    'f2': 'F2',
    'f3': 'F3',
    'f4': 'F4',
    'f5': 'F5',
    'f6': 'F6',
    'f7': 'F7',
    'f8': 'F8',
    'f9': 'F9',
    'f10': 'F10',
    'f11': 'F11',
    'f12': 'F12',
    'minus': '-',
    'equal': '=',
    'plus': '+',
 };

  static isModifierKey(key: string | undefined): boolean {
    if (!key) return false;
    const normalizedKey = this.modifierKeyMap[key.toLowerCase()] || key;
    return ['Control', 'Alt', 'Shift', 'Meta'].includes(normalizedKey);
  }

  static getPlaywrightKey(key: string | undefined): string {
    if (!key) {
      throw new Error('Key cannot be undefined');
    }

    const normalizedKey = key.toLowerCase();

    // Handle special cases
    if (normalizedKey in this.keyMap) {
      return this.keyMap[normalizedKey] as string;
    }

    // Normalize modifier keys
    if (normalizedKey in this.modifierKeyMap) {
      return this.modifierKeyMap[normalizedKey] as string;
    }

    // Return the key as is - Playwright handles standard key names
    return key;
  }

  static parseKeyCombination(combo: string): string[] {
    if (!combo) {
      throw new Error('Key combination cannot be empty');
    }
    return combo.toLowerCase().split('+').map(key => {
      const trimmedKey = key.trim();
      if (!trimmedKey) {
        throw new Error('Invalid key combination: empty key');
      }
      return this.getPlaywrightKey(trimmedKey);
    });
  }
}

