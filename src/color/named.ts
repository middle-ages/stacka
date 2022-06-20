import { option as OP } from 'fp-ts';
import { hex } from './hex/ops';
import { AnonColor, Layer } from './types';

const named = {
  dim: hex('#605040'),
  dimmer: hex('#515151'),

  head: hex('#c0700f'),
  highlight: hex('#ff50f0'),
  message: hex('#509faf'),

  ok: hex('#0f0'),
  ko: hex('#f00'),
  black: hex('#000'),
  white: hex('#fff'),
  lighter: hex('#f0f0f0'),
  light: hex('#e0e0e0'),
  lighterGrey: hex('#cacaca'),
  lightGrey: hex('#bbb'),
  grey: hex('#aaa'),
  darkGrey: hex('#999'),
  darkerGrey: hex('#6f6f6f'),
  darkestGrey: hex('#555'),
  dark: hex('#343434'),
  darker: hex('#151515'),
  darkest: hex('#080808'),

  blue: hex('#00f'),
  red: hex('#f00'),
  yellow: hex('#e0b000'),
  pink: hex('#ffc0ff'),
  green: hex('#0f0'),
  cyan: hex('#0ff'),
  darkCyan: hex('#088'),
  orange: hex('#ef8500'),
  darkBlue: hex('#000068'),
  darkRed: hex('#580000'),
  darkGreen: hex('#005800'),
  magenta: hex('#f0f'),
  darkMagenta: hex('#909'),
} as const;

export type NamedColor = keyof typeof named;

export type Color = NamedColor | AnonColor;

export type MaybeColor = OP.Option<Color>;

/** Either a foreground or background color, determined by 1st element */
export type LayerColor = [Layer, Color];

export const isNamed = (s: string | NamedColor): s is NamedColor => s in named;

export const exportNamed = {
  ...named,
  isNamed,
} as const;
