import { array as AR, function as FN } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import { Unary } from 'util/function';
import { Pair, pairMap } from 'util/tuple';
import { maxPos, minPos, Pos, posPair, posT, sizeFromCorners } from './pos';
import { rect, Rect } from './rect';

export const [rectBottom, rectRight]: Pair<Unary<Rect, number>> = [
  r => rect.top.get(r) + rect.height.get(r) - 1,
  r => rect.left.get(r) + rect.width.get(r) - 1,
];

export const rectBottomRight: Unary<Rect, Pos> = FN.flow(
  fork([rectBottom, rectRight]),
  posT,
);

export const getCorners: Unary<Rect, Pair<Pair<number>>> = r =>
  FN.pipe(r, fork([rect.pos.get, rectBottomRight]), pairMap(posPair));

export const [minTopLeft, maxBottomRight]: Pair<Unary<Rect[], Pos>> = [
  FN.flow(AR.map(rect.pos.get), minPos),
  FN.flow(AR.map(rectBottomRight), maxPos),
];

export const bounds: Unary<Rect[], Rect> = rs => {
  const [tl, br] = FN.pipe(rs, fork([minTopLeft, maxBottomRight]));
  return rect(tl, sizeFromCorners([tl, br]));
};
