import * as flow from './flow';
import * as win from './win';
import * as labeled from './labeled';
import * as basic from './basic';

export type { FlowConfig, MinFlowConfig } from './flow';
export type { WinFlowConfig } from './win';

export const boxes = {
  ...flow,
  ...labeled,
  ...basic,
  win,
  line: basic.line,
} as const;
