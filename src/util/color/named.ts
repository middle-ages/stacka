import chalk from 'chalk';
import { Endo, Unary } from 'util/function';
import { hex, HexColor } from '../hex';
import { Pair } from '../tuple';
import { Color, noColor } from './types';

export const nameMap = {
  dim: hex('#aaa'),
  dimmer: hex('#666'),
  head: hex('#e0b00f'),
  highlight: hex('#ff00ff'),
  ko: hex('#ff0000'),
  message: hex('#00ffff'),
  ok: hex('#00ff00'),
  black: hex('#000'),
  white: hex('#fff'),
  light: hex('#eee'),
  grey: hex('#bbb'),
  dark: hex('#555'),
  blue: hex('#00f'),
} as const;

export type NamedColor = keyof typeof nameMap;

export const colorByName: Unary<NamedColor, HexColor> = c => nameMap[c];

export const [noneFg, noneBg]: Pair<Color> = [noColor.fg, noColor.bg];

export const isNamedColor = (s: string | NamedColor): s is NamedColor =>
  s in nameMap;

export const bold: Endo<string> = chalk.bold;
