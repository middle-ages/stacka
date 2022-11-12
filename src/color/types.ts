import * as CN from 'color-name';
import * as CD from 'colord';
import { AnyColor, Colord, HslaColor, HslColor, RgbaColor } from 'colord';
import { function as FN, record as RC } from 'fp-ts';
import { Unary } from 'util/function';
import * as HSL from './hsla';
import * as RGB from './rgba';
import { ColorBin, Rgba } from './rgba';

export type { HslaColor, RgbaColor } from 'colord';
export type { HslaChannel, HslChannel } from './hsla';
export type {
  Channel as RgbaChannel,
  ColorBin,
  RgbaTuple,
  RgbChannel,
  RgbTuple,
} from './rgba';

/**
 * `Color` is a union type of:
 *
 * 1. `ColorBin` - the packed color type, a 32bit unsigned integer. Easiest way
 *    to create one is using the hexadecimal number type, E.g:
 *    `const opaqueBlue: Color = 0xffff0000`. Note the order is little endian:
 *    `a`, `b`, `g`, `r`.
 * 1. `RgbaTuple` - A `Uint8ClampedArray` of 4 channels: red, green, blue and
 *    opacity. All are in the range of 0-255.
 * 1. `RgbTuple` - A `Uint8ClampedArray` of 3 channels: red, green, blue. Opacity
 *    is implied to be 100% opaque
 * 1. `RgbaColor` - a record of `RgbChannel`s to a byte values, and alpha to a
 *    float between 0 and 1. Defined in
 *    [colord](https://github.com/omgovich/colord/blob/master/src/types.ts#L51)
 * 1. `RgbColor` - an `RgbaColor` that is implicitly opaque
 * 1. `HslaColor` - Defined in
 *    [colord](https://github.com/omgovich/colord/blob/master/src/types.ts#L52)
 *    as a record with keys `h` in degrees 0-360, `l` and `s` as percentages in
 *    range 0-100, and `a` as a float between 0 and 1 just like in `RgbaColor`.
 *    Compared to RGB, this color space simplifies some color operations, but
 *    like RGB it is a simple color space that fails to take into account human
 *    perception.
 * 1. `HslColor` - an `HslaColor` that is implicitly opaque
 * 1. `NamedColor` - a [CSS named
 *    color](https://developer.mozilla.org/en-US/docs/Web/CSS/named-color), also
 *    known as X11 colors. These are type checked when entered as literals to
 *    avoid spelling errors.
 *
 */
export type Color = Rgba | HslaColor | HslColor | ColorName;

/**
 * The type of a named CSS color. Taken from
 * [color-name](https://www.npmjs.com/package/color-name).
 */
export type ColorName = keyof typeof CN;

export const empty: Color = 0;

export const colorNames: ColorName[] = RC.keys(CN),
  fromName: Unary<ColorName, ColorBin> = n =>
    RGB.fromRgbaTuple([...CN[n], 255]),
  nameToRgba: Unary<ColorName, RgbaColor> = n => {
    const [r, g, b] = CN[n];
    return { r, g, b, a: 1 };
  };

export const matchColor =
  <R>(
    bin: Unary<ColorBin, R>,
    named: Unary<ColorName, R>,
    rgba: Unary<RgbaColor, R>,
    hsla: Unary<HslaColor, R>,
  ): Unary<Color, R> =>
  c =>
    typeof c === 'number'
      ? bin(c)
      : typeof c === 'string'
      ? named(c)
      : Array.isArray(c)
      ? rgba({ r: c[0], g: c[1], b: c[2], a: c.length === 3 ? 1 : c[3] })
      : 'h' in c
      ? hsla('a' in c ? c : { ...c, a: 1 })
      : rgba({ ...c, a: 'a' in c ? c.a : 1 });

/** Normalize any color value into a 32bit number */
export const normalize: Unary<Color, ColorBin> = matchColor(
    FN.identity,
    fromName,
    RGB.fromRgbaColor,
    HSL.binIso.reverseGet,
  ),
  normalized = <T>(f: Unary<ColorBin, T>): Unary<Color, T> =>
    FN.flow(normalize, f);

/** Normalize any color value into an RGBA record color */
export const toRgbaColor: Unary<Color, RgbaColor> = matchColor(
  RGB.toRgbaColor,
  nameToRgba,
  FN.identity,
  HSL.toRgbaColor,
);

/**
 * Convert a color to a (colord)[https://github.com/omgovich/colord] object
 * for conversion/manipulation.
 */
export const asColord: Unary<Color, Colord> = FN.flow(toRgbaColor, CD.colord);

/**
 * Create a new color from any format supported by
 * (colord)[https://github.com/omgovich/colord]. For example:
 *
 * ```ts
 * import { colord, Color } from 'stacka';
 *
 * const hsl: Color = colord('hsl(0deg, 25%, 50%)');
 * ```
 *
 * See (colord docs)[https://github.com/omgovich/colord#getting-started] for a
 * list of accepted color types.
 */
export const colord: Unary<AnyColor, ColorBin> = c =>
    RGB.fromRgbaColor(CD.colord(c).rgba),
  /**
   * Build a color from its RGBA channels. `r`,`g`, and `b` are 0-255 and `a` is 0-1
   */
  build = (r: number, g: number, b: number, a: number): RgbaColor => ({
    r,
    g,
    b,
    a,
  }),
  rgbaT = FN.tupled(build);
