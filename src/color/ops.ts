import ansis from 'ansis';
import { function as FN } from 'fp-ts';
import { Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import * as CL from './lens';
import { Color, LayerColor } from './named';
import { Layer } from './types';

export const layers: Pair<Layer> = ['fg', 'bg'];

export const withLayerKeys = <A, B>([a, b]: [A, B]): { fg: A; bg: B } => ({
  fg: a,
  bg: b,
});

export const flipLayer: Endo<Layer> = layer => (layer === 'fg' ? 'bg' : 'fg');

/** Colorize a string with the given color */
export const fg: Unary<Color, Endo<string>> = FN.flow(
    CL.rgb.get,
    FN.tupled(ansis.rgb),
  ),
  /** Colorize the given string background with the given color */
  bg: Unary<Color, Endo<string>> = FN.flow(CL.rgb.get, FN.tupled(ansis.bgRgb)),
  /** Colorize the string and its background using the given color pair */
  of: Unary<Pair<Color>, Endo<string>> = ([fgColor, bgColor]) =>
    FN.flow(fg(fgColor), bg(bgColor));

/** Color the string at the given layer with the given color */
export const colorLayer: Unary<LayerColor, Endo<string>> = ([layer, c]) =>
  (layer === 'fg' ? fg : bg)(c);
