import * as BLE from 'color-blend';
import { Unary } from 'src/util/function';
import { typedKeys } from 'src/util/object';
import { Hex } from './hex/types';

/**
 * Color Types
 *
 * The basic normalized color type is `Record<'r'|'g'|'b'|'a', number>`, where
 * the range is 0-255 for the `r`/`g`/`b` components and 0-1 for the `a`
 * component. The `a` component stands for opacity as in CSS and not for alpha
 * channel: `a=1` means 100% opaque and `a=0` means 100% transparent.
 *
 * `Hex` values, useful for compile time checking of literal colors, are also
 * accepted as colors. If no opacity is given, it is set as 100% opaque.
 *
 * Values of the `hwb` color space, of the type `Record<'h'|'w'|'b',number>`,
 * where `h` is an angle in degrees in range 0-360, and `w`/`b` are percentage
 * values in range 0-100.
 */
export const rgbaKeys = ['r', 'g', 'b', 'a'] as const,
  hwbaKeys = ['h', 'w', 'b', 'a'] as const;

export type RgbaKey = typeof rgbaKeys[number];
export type HwbaKey = typeof hwbaKeys[number];

export type Rgba = Record<RgbaKey, number>;
export type Hwba = Record<HwbaKey, number>;

export type AnonColor = Rgba | Hwba | Hex;

export type Layer = 'fg' | 'bg';

export type BlendMode =
  | 'over'
  | 'under'
  | 'combineOver'
  | 'combineUnder'
  | keyof typeof BLE;

export const opacityLevels = {
  opaque: 1,
  semiOpaque: 0.7,
  semiTransparent: 0.3,
  transparent: 0,
} as const;

export type OpacityLevel = keyof typeof opacityLevels;

export const opacityLevelNames: OpacityLevel[] = typedKeys(opacityLevels);

export const opacityLevelAt: Unary<OpacityLevel, number> = l =>
  opacityLevels[l];
