import { Unary } from 'util/function';
import { Pair, Tuple3 } from 'util/tuple';
import { hasHexColorTag, HexColor } from '../hex';
import { colorByName, isNamedColor, NamedColor } from './named';

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export type RGB = Tuple3<number>;

export type Color = HexColor | NamedColor | HslColor;

export type TextColor = Record<'fg' | 'bg', Color>;

export const noColor: TextColor = { fg: 'white', bg: 'black' };

export const normalize = (c: HexColor | NamedColor): HexColor => {
  if (hasHexColorTag(c)) return c;
  if (isNamedColor(c)) return colorByName(c);
  throw new Error(`Invalid color “${c}”`);
};

export const textColor: Unary<Pair<Color>, TextColor> = ([fg, bg]) => ({
  fg,
  bg,
});

export const hsl = (h: number, s: number, l: number): HslColor => ({ h, s, l });
