import { ComputerTool20241022, ComputerTool20250124 } from './computer';
import { BrowserTool } from './browser';
import { Action } from '../types/computer';
import type { ActionParams, ToolResult } from '../types/computer';
import type { BrowserToolResult } from './browser';

export type ToolVersion = 'computer_use_20250124' | 'computer_use_20241022' | 'computer_use_20250429';

export const DEFAULT_TOOL_VERSION: ToolVersion = 'computer_use_20250429';

interface ToolGroup {
  readonly version: ToolVersion;
  readonly tools: (typeof ComputerTool20241022 | typeof ComputerTool20250124)[];
  readonly beta_flag: string;
  readonly additionalTools?: any[];
}

export const TOOL_GROUPS: ToolGroup[] = [
  {
    version: 'computer_use_20241022',
    tools: [ComputerTool20241022],
    beta_flag: 'computer-use-2024-10-22',
    additionalTools: [BrowserTool],
  },
  {
    version: 'computer_use_20250124',
    tools: [ComputerTool20250124],
    beta_flag: 'computer-use-2025-01-24',
    additionalTools: [BrowserTool],
  },
  // 20250429 version inherits from 20250124
  {
    version: 'computer_use_20250429',
    tools: [ComputerTool20250124],
    beta_flag: 'computer-use-2025-01-24',
    additionalTools: [BrowserTool],
  },
];

export const TOOL_GROUPS_BY_VERSION: Record<ToolVersion, ToolGroup> = Object.fromEntries(
  TOOL_GROUPS.map(group => [group.version, group])
) as Record<ToolVersion, ToolGroup>;

export class ToolCollection {
  private tools: Map<string, ComputerTool20241022 | ComputerTool20250124 | BrowserTool>;

  constructor(...tools: (ComputerTool20241022 | ComputerTool20250124 | BrowserTool)[]) {
    this.tools = new Map(tools.map(tool => [tool.name, tool]));
  }

  toParams(): any[] {
    return Array.from(this.tools.values()).map(tool => tool.toParams());
  }

  async run(name: string, toolInput: any): Promise<ToolResult | BrowserToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    // Browser tool has different input structure
    if (tool instanceof BrowserTool) {
      return await tool.call(toolInput);
    }

    // Computer tool validation
    if (!('action' in toolInput) || !Object.values(Action).includes(toolInput.action)) {
      throw new Error(`Invalid action ${toolInput.action} for tool ${name}`);
    }

    return await tool.call(toolInput);
  }
}

