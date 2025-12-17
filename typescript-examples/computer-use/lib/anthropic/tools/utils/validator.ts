import { Action, ToolError } from '../../types/computer';
import type { ActionParams, Coordinate, Duration } from '../../types/computer';

export class ActionValidator {
  static validateText(text: string | undefined, required: boolean, action: string): void {
    if (required && text === undefined) {
      throw new ToolError(`text is required for ${action}`);
    }
    if (text !== undefined && typeof text !== 'string') {
      throw new ToolError(`${text} must be a string`);
    }
  }

  static validateCoordinate(coordinate: Coordinate | undefined, required: boolean, action: string): void {
    if (required && !coordinate) {
      throw new ToolError(`coordinate is required for ${action}`);
    }
    if (coordinate) {
      this.validateAndGetCoordinates(coordinate);
    }
  }

  static validateDuration(duration: Duration | undefined): void {
    if (duration === undefined || typeof duration !== 'number') {
      throw new ToolError(`${duration} must be a number`);
    }
    if (duration < 0) {
      throw new ToolError(`${duration} must be non-negative`);
    }
    if (duration > 100) {
      throw new ToolError(`${duration} is too long`);
    }
  }

  static validateAndGetCoordinates(coordinate: Coordinate): Coordinate {
    if (!Array.isArray(coordinate) || coordinate.length !== 2) {
      throw new ToolError(`${coordinate} must be a tuple of length 2`);
    }
    if (!coordinate.every(i => typeof i === 'number' && i >= 0)) {
      throw new ToolError(`${coordinate} must be a tuple of non-negative numbers`);
    }
    return coordinate;
  }

  static validateActionParams(params: ActionParams, mouseActions: Set<Action>, keyboardActions: Set<Action>): void {
    const { action, text, coordinate, duration } = params;

    // Validate text parameter
    if (keyboardActions.has(action)) {
      this.validateText(text, true, action);
    } else {
      this.validateText(text, false, action);
    }

    // Validate coordinate parameter
    if (mouseActions.has(action)) {
      this.validateCoordinate(coordinate, true, action);
    } else {
      this.validateCoordinate(coordinate, false, action);
    }

    // Validate duration parameter
    if (action === Action.HOLD_KEY || action === Action.WAIT) {
      this.validateDuration(duration);
    }
  }
}

