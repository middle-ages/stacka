import { HslColor } from 'colord';
import { function as FN } from 'fp-ts';
import * as LE from 'monocle-ts/Lens';
import { fromKeys, typedKeys } from 'util/object';
import { LensResult, ModLens, modLens } from 'util/lens';
import * as HSL from './hsla';
import { HslChannel } from './hsla';
import * as RGB from './rgba';
import { Channel, ColorBin, RgbTuple } from './rgba';
import { Color, normalize } from './types';

type RgbaLenses = Record<Channel, ModLens<Color, number>>;
type HslLenses = Record<HslChannel, ModLens<Color, number>>;

/** A record with every color lens indexed by name */
export interface ColorLenses extends RgbaLenses, HslLenses {
  rgb: ModLens<Color, RgbTuple>;
  hsl: ModLens<Color, HslColor>;
  opacity: ModLens<Color, number>;
}

export type ColorLens = keyof ColorLenses;

export type ComposedColorLens<T, K extends ColorLens> = ModLens<
  T,
  LensResult<ColorLenses[K]>
>;

export type ComposedColorLenses<T> = {
  [K in ColorLens]: ComposedColorLens<T, K>;
};

/** Normalize any color value into a 32bit number */
const normalizeLens = modLens<Color, ColorBin>({
    get: normalize,
    set: FN.constant,
  }),
  composeNormalized = <R>(lens: ModLens<ColorBin, R>): ModLens<Color, R> =>
    FN.pipe(normalizeLens, LE.composeLens(lens), modLens);

/** RGBA channel color lenses */
export const { r, g, b, a }: RgbaLenses = RGB.channelRecord(channel =>
    composeNormalized(RGB[channel]),
  ),
  /** HSL channel color lenses */
  { h, l, s }: HslLenses = HSL.hslaRecord(channel =>
    composeNormalized(HSL.binLens[channel]),
  ),
  rgb: ModLens<Color, RgbTuple> = composeNormalized(RGB.rgb),
  hsl: ModLens<Color, HslColor> = composeNormalized(HSL.hsl),
  /**
   * Opacity lens for any color type. Opacity value is expected and returned as a
   * float between zero and one. Lower opacity value means more transparent, with
   * zero meaning 100% transparent.
   */
  opacity: ModLens<Color, number> = composeNormalized(RGB.opacity);

export const colorLenses: ColorLenses = {
  r,
  g,
  b,
  a,
  h,
  s,
  l,
  opacity,
  rgb,
  hsl,
};

export const composeColorLens = <T>(outer: ModLens<T, Color>) => {
  const compose = <K extends ColorLens>(key: K): ComposedColorLens<T, K> =>
    FN.pipe(
      outer,
      LE.composeLens(
        colorLenses[key] as ColorLenses[K] &
          ModLens<Color, LensResult<ColorLenses[K]>>,
      ),
      modLens,
    );
  return FN.pipe(
    compose,
    fromKeys(typedKeys(colorLenses)),
  ) as ComposedColorLenses<T>;
};
