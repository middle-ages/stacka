import { array as AR, option as OP, function as FN } from 'fp-ts';
import { Rect, rect } from 'src/geometry';
import { Painter, Canvas, paintRect, canvasOf } from 'src/canvas';
import { Tuple4 } from 'util/tuple';

export const pa: Painter<Rect> = { ...paintRect, fillChar: OP.some('.') };

export const canvas = canvasOf(pa);

export const rects: Rect[] = FN.pipe(
  [
    [0, 0, 1, 1],
    [3, 0, 1, 1],
    [1, 3, 2, 3],
    [0, 3, 1, 2],
  ] as Tuple4<number>[],

  AR.mapWithIndex((i, q) =>
    FN.pipe(
      q,
      rect.fromTuple,
      FN.pipe(['A', 'B', 'C', 'D'][i], OP.some, rect.fillChar.set),
    ),
  ),
);

export const egCanvas: Canvas<Rect> = canvas(rects);
