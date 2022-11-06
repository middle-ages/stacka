import assert from 'assert';
import { array as AR, function as FN } from 'fp-ts';
import { uncurry2 } from 'fp-ts-std/Function';
import { append, unlines } from 'fp-ts-std/String';
import { toSnd } from 'fp-ts-std/Tuple';
import { color as CO } from 'src/color';
import { addBefore, chunksOf } from 'util/array';
import { Binary, BinaryC, BinOpC } from 'util/function';
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

// zip and concat a row pair
const zipRows: BinOpC<string[]> = left => right =>
  FN.pipe(right, AR.zip(left), FN.pipe(append, uncurry2, AR.map));

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
      AR.map(
        AR.map(([c, m]: [string, Matrix]) => [
          [leftSpace, color(c === ' ' ? '␠' : c), rightSpace, fence].join(''),
          ...AR.map(s => s + leftSpace)(quadResWith(px)(m)),
        ]),
      ),
    );

    assert(columns.length > 0, `empty role: “${role}”`);

    return FN.pipe(
      columns,
      AR.chain(([head, ...columns]) =>
        FN.pipe(
          columns,
          AR.reduce(head, (acc, cur) => FN.pipe(cur, zipRows(acc))),
        ),
      ),
      addBefore(['', ' ' + (idx + 1) + '. ' + roleColor(role)]),
      unlines,
    );
  };

/** A report showing registered bitmaps and their glyphs at some width */
export const rolesReport: BinaryC<number, BitmapRole[], string> = width =>
  FN.flow(FN.pipe(width, roleReport, AR.mapWithIndex), unlines);
