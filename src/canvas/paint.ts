import { array as AR, function as FN } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import { RowList, RowMapper } from 'src/types';
import { zip } from 'util/array';
import { Binary, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { fillOrSpace } from '../geometry';
import { canvasOpsOf } from './ops';
import { replaceCenter, replaceMiddle } from './replace';
import { Canvas, Painter } from './types';

const paintRows: Binary<Pair<number>, RowList, RowMapper> = (where, paint) =>
  FN.flow(zip(paint), FN.pipe(where, replaceCenter, AR.map));

const paintStep =
  <T>(pa: Painter<T>): Binary<RowList, T, RowList> =>
  (rows, t) => {
    const [{ top, left }, { width, height }] = FN.pipe(
        t,
        fork([pa.pos, pa.size]),
      ),
      content: RowMapper = paintRows([left, width], pa.paint(t));

    return FN.pipe([rows, content], replaceMiddle([top, height]));
  };

/**
 * Given a `Painter<T>` converts a canvas of rectangular `T`s into a list of
 * strings, with areas unoccupied by rectangles filled with the fill character.
 */
export const paintOf =
  <T>(pa: Painter<T>): Unary<Canvas<T>, RowList> =>
  c => {
    const [, ops] = canvasOpsOf(pa);
    return FN.pipe(
      c.nodes,
      AR.reduce(
        FN.pipe(c, ops.measure, fillOrSpace(pa.fillChar)),
        paintStep(pa),
      ),
    );
  };
