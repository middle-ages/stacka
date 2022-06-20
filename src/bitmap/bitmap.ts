import { roleReport, report } from './report';
import { registry } from './registry';
import * as quadRes from './quadRes';
import * as role from './role';
import * as data from './data';
import * as ops from './ops';
import { named, isDirect } from './named';

export type {
  Px,
  PxRow,
  Matrix,
  MatrixRow,
  TupleRes,
  RowOp,
  RowCheck,
  Check,
  RelCheck,
} from './data';

export type { Dash, Direct, Orient } from './named';
export type { BitmapRole } from './role';
export type { Registry } from './registry';

export const bitmap = {
  ...role,
  ...data,
  ...ops,
  ...quadRes,
  ...registry,
  ...named,
  registry: registry.reg,
  elbowsFor: named.elbowsFor,
  tee: named.tee,
  roleReport,
  isDirect,
  report,
} as const;
