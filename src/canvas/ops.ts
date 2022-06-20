import { array as AR, function as FN } from 'fp-ts';
import * as LE from 'monocle-ts/lib/Lens';
import { bounds, rect, Rect, Size } from 'src/geometry';
import { zip } from 'util/array';
import { Unary } from 'util/function';
import { Canvas, Painter } from './types';

export const canvasOpsOf = <T>(pa: Painter<T>) => {
  const build = (nodes: T[]): Canvas<T> => ({ nodes });

  const nodes = FN.pipe(LE.id<Canvas<T>>(), LE.prop('nodes'));

  const asRects: Unary<Canvas<T>, Rect[]> = c => {
    const ns = nodes.get(c);

    return FN.pipe(
      ns,
      AR.map(pa.pos),
      FN.pipe(ns, AR.map(pa.size), zip),
      AR.map(rect.tupled),
      FN.pipe(pa.fillChar, rect.fillChar.set, AR.map),
    );
  };

  const measure: Unary<Canvas<T>, Size> = FN.flow(
    asRects,
    bounds,
    rect.size.get,
  );

  return [build, { nodes, asRects, measure }] as const;
};
