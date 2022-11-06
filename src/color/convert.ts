import { hwb, rgb } from 'color-convert';
import { function as FN } from 'fp-ts';
import { Unary } from 'util/function';
import { hexToRgba as convertHex } from './hex/ops';
import { hasHexValueTag, Hex } from './hex/types';
import { Color, exportNamed, isNamed, NamedColor } from './named';
import { Hwba, Rgba } from './types';

const hexToRgba: Unary<Hex, Rgba> = c => {
  const [r, g, b, a] = convertHex(c);
  return { r, g, b, a };
};

const namedToRgba: Unary<NamedColor, Rgba> = c => {
  if (typeof c !== 'string' || !isNamed(c)) {
    throw new Error(`Invalid named color “${c}”`);
  }
  return hexToRgba(exportNamed[c]);
};

const hwbaToRgba: Unary<Hwba, Rgba> = ({ h, w, b: givenB, a }) => {
  const [r, g, b] = hwb.rgb([h, w, givenB]);
  return { r, g, b, a };
};

const rgbaToHwba: Unary<Rgba, Hwba> = ({ r, g, b: givenB, a }) => {
  const [h, w, b] = rgb.hwb([r, g, givenB]);
  return { h, w, b, a };
};

export const normalize: Unary<Color, Rgba> = c =>
  typeof c === 'object'
    ? 'r' in c
      ? (c as Rgba)
      : hasHexValueTag(c)
      ? hexToRgba(c)
      : hwbaToRgba(c)
    : namedToRgba(c);

export const toHwba: Unary<Color, Hwba> = FN.flow(normalize, rgbaToHwba),
  toRgba = normalize;
