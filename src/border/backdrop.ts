import { function as FN, option as OP, readonlyArray as RA } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { Box, box, BoxSet } from 'src/box';
import { Color } from 'src/color';
import { Style } from 'src/style';
import { Binary, Endo, Unary } from 'util/function';
import { mapValues } from 'util/object';
import { Pair, Tuple3, tuple3Map, Tuple4 } from 'util/tuple';
import { apply } from './apply';
import { sets } from './sets';
import { Border, BorderName } from './types';

const fromBoxOp: Unary<Endo<Box>, Endo<Border>> = FN.flow(OP.map, mapValues);

const fromUnaryBoxOp = <T>(f: BoxSet<T>): Unary<T, Endo<Border>> =>
  FN.flow(f, OP.map, mapValues);

export const [setFg, setBg]: Pair<Unary<Color, Endo<Border>>> = FN.pipe(
  [box.setGridFg, box.setGridBg],
  mapBoth(fromUnaryBoxOp),
);

export const colorBg: Unary<Color, Endo<Border>> = FN.flow(
  box.colorBg,
  fromBoxOp,
);

export const setColor: Unary<Pair<Color>, Endo<Border>> = ([fg, bg]) =>
  FN.flow(setFg(fg), setBg(bg), colorBg(bg));

export const [unsetFg, unsetBg, unsetColor]: Tuple3<Endo<Border>> = FN.pipe(
  [box.clearFg, box.clearBg, box.clearColor],
  tuple3Map(fromBoxOp),
);

export const setStyle: Unary<Style, Endo<Border>> = fromUnaryBoxOp(
  box.setGridStyle,
);

/** Sugar for creating + setting a color + adding border in one go */
export const [withFg, withBg, withColorBg] = FN.pipe(
  [setFg, setBg, colorBg] as const,
  RA.map(
    f => (name: BorderName, color: Color) =>
      FN.pipe(sets[name], f(color), apply),
  ),
) as Tuple4<Binary<BorderName, Color, Endo<Box>>>;

/**
 * Given a border set name and a pair of fg/bg colors, add the border to the
 * given box
 */
export const colored: Binary<BorderName, Pair<Color>, Endo<Box>> = (
  name,
  pair,
) => FN.pipe(sets[name], setColor(pair), apply);
