import assert from 'assert';
import { array as AR, function as FN } from 'fp-ts';
import { unlines } from 'fp-ts-std/String';
import { toSnd } from 'fp-ts-std/Tuple';
import { color as CO } from 'src/color';
import { addBefore, chunksOf, map2 } from 'util/array';
import { Binary, Unary } from 'util/function';
import { zipReduceRows } from 'util/string';
import { Matrix, resolution } from './data';
import { quadResWith } from './quadRes';
import { registry as reg } from './registry';
import { BitmapRole } from './role';

const color = CO.of(['darkBlue', 'light']),
  underline = CO.of(['darkGrey', 'grey']),
  fence = underline('|'), // ▐
  roleColor = CO.fg('orange'),
  px = CO.of(['dark', 'light']),
  leftSpace = FN.pipe(' ', CO.bg('lighterGrey')),
  rightSpace = FN.pipe('  ', CO.bg('lighterGrey'));

/** Report of a single role at a width */
export const roleReport =
  (width: number): Binary<number, BitmapRole, string> =>
  (idx, role) => {
    const perRow = Math.floor(width / (1 + resolution / 2));
    const columns = FN.pipe(
      role,
      reg.charsByRole,
      FN.pipe(reg.matrixByChar, toSnd, AR.map),
      chunksOf(perRow),
      map2(([c, m]: [string, Matrix]) => [
        [leftSpace, color(c === ' ' ? '␠' : c), rightSpace, fence].join(''),
        ...AR.map(s => s + leftSpace)(quadResWith(px)(m)),
      ]),
    );

    assert(columns.length > 0, `empty role: “${role}”`);

    return FN.pipe(
      columns,
      AR.chain(zipReduceRows),
      addBefore(['', ' ' + (idx + 1) + '. ' + roleColor(role)]),
      unlines,
    );
  };

/** A report showing registered bitmaps and their glyphs for a width */
export const report: Unary<number, string> = width =>
  FN.pipe(reg.roles, FN.pipe(width, roleReport, AR.mapWithIndex), unlines);
