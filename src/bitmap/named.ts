import * as elbow from './named/elbow';
import { line, dash } from './named/line';
import * as other from './named/other';

export * from './named/types';
export type { Solid } from './named/other';
export type {
  HNearLine,
  VNearLine,
  HCornerLine,
  VCornerLine,
} from './named/line';

export const named = { line, dash, ...elbow, ...other } as const;
