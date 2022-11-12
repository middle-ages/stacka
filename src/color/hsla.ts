import { colord as CD, HslaColor, HslColor, RgbaColor } from 'colord';
import { function as FN } from 'fp-ts';
import { omit } from 'fp-ts-std/ReadonlyStruct';
import * as IS from 'monocle-ts/Iso';
import * as LE from 'monocle-ts/Lens';
import { Unary } from 'util/function';
import { ModLens, modLens } from 'util/lens';
import { fromKeys, FromKeys } from 'util/object';
import * as RGB from './rgba';
import { ColorBin, Rgba, RgbaTuple } from './rgba';

export type HslChannel = keyof HslColor;
export type HslaChannel = keyof HslaColor;

/** A value from the HSL color space */
export type Hsl = HslColor | HslaColor;

export const hslChannels = ['h', 's', 'l'] as const,
  hslaChannels = [...hslChannels, 'a'] as const,
  hslaRecord: FromKeys<HslaChannel> = fromKeys(hslaChannels);

export const isHsla = (o: Rgba | HslaColor): o is HslaColor =>
  typeof o !== 'number' && 'h' in o;

export const fromRgbaTuple: Unary<RgbaTuple, HslaColor> = ([r, g, b, a]) =>
    CD({ r, g, b, a: a / 255 }).toHsl(),
  toRgbaTuple: Unary<HslaColor, RgbaTuple> = hsla => {
    const { r, g, b, a } = CD(hsla).rgba;
    return [r, g, b, Math.floor(a * 255)];
  },
  rgbaTupleIso = IS.iso<RgbaTuple, HslaColor>(fromRgbaTuple, toRgbaTuple);

export const toRgbaColor: Unary<HslaColor, RgbaColor> = hsla => CD(hsla).rgba,
  fromRgbaColor: Unary<RgbaColor, HslaColor> = rgba => CD(rgba).toHsl(),
  rgbaColorIso = IS.iso<RgbaColor, HslaColor>(fromRgbaColor, toRgbaColor);

export const binIso = IS.iso<ColorBin, HslaColor>(
  FN.flow(RGB.toRgbaTuple, fromRgbaTuple),
  FN.flow(toRgbaTuple, RGB.fromRgbaTuple),
);

export const hsl = modLens<ColorBin, HslColor>({
  get: FN.flow(binIso.get, omit(['a'])),
  set: hsl => cb =>
    FN.pipe({ ...hsl, a: RGB.a.get(cb) }, toRgbaTuple, RGB.fromRgbaTuple),
});

export const fromHsl: Unary<Hsl, ColorBin> = hsl =>
  FN.pipe('a' in hsl ? hsl : { ...hsl, a: 1 }, binIso.reverseGet);

/** HSLA channel lenses for the `HslaColor` type */
export const hslaLens: Record<
  HslaChannel,
  ModLens<HslaColor, number>
> = hslaRecord(key => FN.pipe(LE.id<HslaColor>(), LE.prop(key), modLens));

/** HSLA channel lenses for the `ColorBin` type */
export const binLens: Record<
  HslaChannel,
  ModLens<ColorBin, number>
> = hslaRecord(key => FN.pipe(binIso, IS.composeLens(hslaLens[key]), modLens));
