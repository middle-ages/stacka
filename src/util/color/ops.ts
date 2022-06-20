import chalk from 'chalk';
import { function as FN } from 'fp-ts';
import { Unary } from 'util/function';
import { typedValues } from 'util/object';
import { leftTupleWith, Pair, tupleWith } from 'util/tuple';
import { Endo } from 'util/function';
import { hsl as hslConvert } from 'color-convert';
import { hasHexColorTag, hexToRgb } from 'util/hex';
import { colorByName, isNamedColor, noneBg, noneFg } from './named';
import { Color, HslColor, RGB, TextColor, textColor } from './types';

export const hslToRgb: Unary<HslColor, RGB> = FN.flow(
  typedValues,
  hslConvert.rgb,
);

export const colorToRgb: Unary<Color, RGB> = c =>
  typeof c === 'string' && isNamedColor(c)
    ? hexToRgb(colorByName(c))
    : hasHexColorTag(c)
    ? hexToRgb(c)
    : hslToRgb(c);

export const [fgColor, bgColor]: Pair<Unary<Color, TextColor>> = [
  FN.flow(leftTupleWith(noneBg), textColor),
  FN.flow(tupleWith(noneFg), textColor),
];

export const [colorizeFg, colorizeBg]: Pair<Unary<Color, Endo<string>>> = [
  c => chalk.rgb(...colorToRgb(c)),
  c => chalk.bgRgb(...colorToRgb(c)),
];

export const colorize: Unary<TextColor, Endo<string>> = ({ fg, bg }) =>
  FN.flow(colorizeFg(fg), colorizeBg(bg));

export const colorNonEmpty: Endo<Endo<string>> = color => s =>
  s.length ? color(s) : '';
