import { function as FN, predicate as PRE } from 'fp-ts';
import * as color from 'src/color';
import { Color, ColorBin } from 'src/color';
import { Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import * as DE from './deco';
import { Deco, DecoList, Decoration } from './deco';

/**
 * ### Cell Style
 *
 * Every possible combination of ANSI SGR styling can be encoded in a single `Style`.
 *
 * A style encodes foreground color, background color, and ANSI decorations.
 *
 * Encoded as 32 bits for foreground color, 32 bits for background color, and 8
 * bits for decorations, 9 octets all together.
 *
 */
export type Style = [fg: ColorBin, bg: ColorBin, deco: Deco];

export type Layer = typeof layers[number];

export const layers = ['fg', 'bg'] as const;

export const empty: Style = [0, 0, 0];

export const getFg: Unary<Style, Color> = st => st[0],
  getBg: Unary<Style, Color> = st => st[1],
  getDeco: Unary<Style, Deco> = st => st[2],
  hasDeco: Unary<Decoration, PRE.Predicate<Style>> = deco =>
    FN.flow(getDeco, DE.hasDeco(deco)),
  getDecoList: Unary<Style, DecoList> = FN.flow(getDeco, DE.decoToList);

export const setFg: Unary<Color, Endo<Style>> =
    fg =>
    ([, bg, deco]) =>
      [color.normalize(fg), bg, deco],
  setBg: Unary<Color, Endo<Style>> =
    bg =>
    ([fg, , deco]) =>
      [fg, color.normalize(bg), deco],
  setDeco: Unary<Deco, Endo<Style>> =
    deco =>
    ([fg, bg]) =>
      [fg, bg, deco],
  setDecoList: Unary<DecoList, Endo<Style>> = FN.flow(DE.listToDeco, setDeco);

export const isEmpty: PRE.Predicate<Style> = st =>
  st[0] === 0 && st[1] === 0 && st[2] === 0;

export const asColorPair: Unary<Style, Pair<Color>> = s => [getFg(s), getBg(s)];
