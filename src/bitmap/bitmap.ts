import { roleReport, rolesReport } from './rolesReport';
import { registry } from './registry';
import * as quadRes from './quadRes';
import * as role from './role';
import * as data from './data';
import * as ops from './ops';
import { named } from './named';

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

export type { BitmapRole } from './role';
export type { Registry } from './registry';
export type { BasicGroup, ElbowGroup, LineGroup } from './named';

export const bitmap = {
  ...role,
  ...data,
  ...ops,
  ...quadRes,
  ...registry,
  ...named,
  registry: registry.reg,
  roleReport,
  rolesReport,
} as const;
