import * as posFns from './geometry/pos';
import * as sizeFns from './geometry/size';
import * as spacingFns from './geometry/spacing';
import * as rectFns from './geometry/rect';
import * as dirFns from './geometry/dir';
import * as cornerFns from './geometry/corner';
import * as borderDirFns from './geometry/borderDir';

export * from './geometry/orientation';

export type { SizeKey, Size } from './geometry/size';
export type { PosKey, Pos } from './geometry/pos';
export type { Spacing } from './geometry/spacing';
export type {
  Rect,
  RectLens,
  RectLensKey,
  RectLensResult,
  RectShift,
  RectShiftArg,
  RectShiftKey,
} from './geometry/rect';
export type {
  Dir,
  Direct,
  Directed,
  Dirs,
  HDir,
  Horizontal,
  OrientDirs,
  ReversedDir,
  VDir,
  Vertical,
} from './geometry/dir';
export type { Corners, Corner, Cornered } from './geometry/corner';
export type { Bordered, BorderDir, BorderDirs } from './geometry/borderDir';
export type { Orient, Orientation } from './geometry/orientation';

export type pos = typeof posFns.build & typeof posFns;
export type size = typeof sizeFns.build & typeof sizeFns;
export type spacing = typeof spacingFns.build & typeof spacingFns;
export type rect = typeof rectFns.build & typeof rectFns;

export type dir = typeof dirFns.value & typeof dirFns;
export type corner = typeof cornerFns.value & typeof cornerFns;
export type borderDir = typeof borderDirFns.value & typeof borderDirFns;

export const pos = posFns.build as pos;
export const size = sizeFns.build as size;
export const spacing = spacingFns.build as spacing;
export const rect = rectFns.build as rect;
export const dir = dirFns.value as dir;
export const corner = cornerFns.value as corner;
export const borderDir = borderDirFns.value as borderDir;

Object.assign(pos, posFns);
Object.assign(size, sizeFns);
Object.assign(spacing, spacingFns);
Object.assign(rect, rectFns);
Object.assign(dir, dirFns);
Object.assign(corner, cornerFns);
Object.assign(borderDir, borderDirFns);
