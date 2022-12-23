import ansis, { Ansis } from 'ansis';
import { function as FN } from 'fp-ts';
import { Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { Color, toRgbaColor } from './types';
import { grays } from './palette';

/** Colorize a string with the given color */
export const fg: Unary<Color, Endo<string>> = c => {
  const { r, g, b, a } = toRgbaColor(c);
  return a === 0 ? FN.identity : ansis.rgb(r, g, b);
};

/** Colorize the given string background with the given color */
export const bg: Unary<Color, Endo<string>> = c => {
  const { r, g, b, a } = toRgbaColor(c);
  return a === 0 ? FN.identity : ansis.bgRgb(r, g, b);
};

/** Colorize foreground and background with the given colors */
export const of: Unary<Pair<Color>, Endo<string>> =
  ([fgColor, bgColor]) =>
  s =>
    fg(fgColor)(bg(bgColor)(s));

/** Add foreground and background to the given
 * [ansis](https://github.com/webdiscus/ansis) object
 */
export const addToAnsis: Unary<Pair<Color>, Endo<Ansis>> =
  ([fgColor, bgColor]) =>
  ansis => {
    const { r: rFg, g: gFg, b: bFg, a: aFg } = toRgbaColor(fgColor),
      { r: rBg, g: gBg, b: bBg, a: aBg } = toRgbaColor(bgColor);

    return aBg === 0
      ? aFg === 0
        ? ansis
        : ansis.rgb(rFg, gFg, bFg)
      : aFg === 0
      ? ansis.bgRgb(rBg, gBg, bBg)
      : ansis.rgb(rFg, gFg, bFg).bgRgb(rBg, gBg, bBg);
  };

export const [grayFg, grayBg]: Pair<Unary<number, Endo<string>>> = [
  n => fg(grays[n]),
  n => bg(grays[n]),
];
