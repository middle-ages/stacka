import { RgbaColor, RgbColor } from 'colord';
import { function as FN, predicate as PRE } from 'fp-ts';
import * as IS from 'monocle-ts/Iso';
import { indexRecord } from 'util/array';
import { Endo, Unary } from 'util/function';
import { modLens } from 'util/lens';
import { fromKeys, FromKeys } from 'util/object';

/**
 * Union of RGBA color types:
 *
 * 1. `ColorBin` - RGBA as a 32bit unsigned integer
 * 1. `RgbTuple` - in a `ByteArray` where `length=3`, `a` is implicitly set to 255
 * 1. `RgbaTuple` - in a `ByteArray` where `length=4`
 * 1. `RgbaColor` - in a record of `r|g|b|a` to number. The color channels are in
 *    the range 0-255 and the opacity is a float between zero and one
 * 1. `RgbColor` - an `RgbaColor` that is implicitly opaque
 *
 */
export type Rgba = ColorBin | RgbTuple | RgbaTuple | RgbaColor | RgbColor;

/**
 * The packed color type: a 32bit unsigned integer, encoding the channels red,
 * gree, blue, and opacity.
 
 * Color channels and opacity are integers in range of 0-255. Higher values of
 * opacity mean _more opaque_. The color is transparent when opacity is 0.
 * 
 */
export type ColorBin = number;

export type RgbChannel = typeof rgbChannels[number];
export type Channel = typeof channels[number];

export type RgbTuple = [r: number, g: number, b: number];
export type RgbaTuple = [...RgbTuple, number]; // 0≤a≤1

export const rgbChannels = ['r', 'g', 'b'] as const,
  channels = [...rgbChannels, 'a'] as const,
  channelRecord: FromKeys<Channel> = fromKeys(channels),
  channelIndex = indexRecord(channels);

export const isTransparent: PRE.Predicate<ColorBin> = c =>
  (c & 0xff000000) === 0;

export const isColorBin = (o: Rgba): o is ColorBin => typeof o === 'number',
  isRgbaTuple = (o: Rgba): o is RgbaTuple => Array.isArray(o) && o.length === 4,
  isRgbTuple = (o: Rgba): o is RgbTuple => Array.isArray(o) && o.length === 3,
  isRgbColor = (o: Rgba): o is RgbColor =>
    typeof o === 'object' && 'r' in o && !('a' in o),
  isRgbaColor = (o: Rgba): o is RgbaColor =>
    typeof o === 'object' && 'r' in o && 'a' in o;

const getRed: Unary<ColorBin, number> = c => c & 0x000000ff,
  getGreen: Unary<ColorBin, number> = c => (c >> 8) & 0x0000ff,
  getBlue: Unary<ColorBin, number> = c => (c >> 16) & 0x00ff,
  getAlpha: Unary<ColorBin, number> = c => (c >> 24) & 0xff;

const setRed: Unary<number, Endo<ColorBin>> = n => c =>
    ((c & 0xffffff00) | n) >>> 0,
  setGreen: Unary<number, Endo<ColorBin>> = n => c =>
    ((c & 0xffff00ff) | (n << 8)) >>> 0,
  setBlue: Unary<number, Endo<ColorBin>> = n => c =>
    ((c & 0xff00ffff) | (n << 16)) >>> 0,
  setAlpha: Unary<number, Endo<ColorBin>> = n => c =>
    ((c & 0x00ffffff) | (n << 24)) >>> 0;

export const toRgbaTuple: Unary<ColorBin, RgbaTuple> = c => [
    getRed(c),
    getGreen(c),
    getBlue(c),
    getAlpha(c),
  ],
  fromRgbaTuple: Unary<RgbaTuple, ColorBin> = t =>
    ((t[3] << 24) | (t[2] << 16) | (t[1] << 8) | t[0]) >>> 0,
  rgbaTupleIso = IS.iso<ColorBin, RgbaTuple>(toRgbaTuple, fromRgbaTuple);

export const toRgbaColor: Unary<ColorBin, RgbaColor> = c => {
    const [r, g, b, a] = toRgbaTuple(c);
    return { r, g, b, a: a / 255 };
  },
  fromRgbaColor: Unary<RgbaColor, ColorBin> = ({ r, g, b, a }) =>
    fromRgbaTuple([r, g, b, Math.floor(a * 255)]),
  rgbaColorIso = IS.iso<ColorBin, RgbaColor>(toRgbaColor, fromRgbaColor);

export const r = modLens({ get: getRed, set: setRed }),
  g = modLens({ get: getGreen, set: setGreen }),
  b = modLens({ get: getBlue, set: setBlue }),
  a = modLens({ get: getAlpha, set: setAlpha }),
  rgb = modLens<ColorBin, RgbTuple>({
    get: c => [getRed(c), getGreen(c), getBlue(c)],
    set: rgb => c => fromRgbaTuple([c & 0xff000000, ...rgb]),
  });

/**
 * Same as the opacity channel lens `a`, but opacity is treated as a float
 * between zero and one, and not as a byte
 */
export const opacity = modLens<ColorBin, number>({
  get: FN.flow(a.get, a => a / 255),
  set: o => a.set(Math.floor(o * 255)),
});
