import { AnserJsonEntry, DecorationName as AnserDeco } from 'anser';
import { array as AR, function as FN } from 'fp-ts';
import * as color from 'src/color';
import { Color, ColorBin } from 'src/color';
import { Unary } from 'util/function';
import { Pair, Tuple3 } from 'util/tuple';
import * as DE from './deco';
import { DecoList, Decoration } from './deco';
import { Style } from './types';
import { Deco } from './deco';

/** Build a style that sets a foreground color */
export const fromFg: Unary<Color, Style> = c => [color.normalize(c), 0, 0],
  /** Build a style that sets a background color */
  fromBg: Unary<Color, Style> = c => [0, color.normalize(c), 0],
  /** Build a style that sets foreground + background colors */
  colored: Unary<Pair<Color>, Style> = ([fg, bg]) => [
    color.normalize(fg),
    color.normalize(bg),
    0,
  ];

/** Build a style that sets ANSI decorations from a list */
export const fromDecoList: Unary<DecoList, Style> = decos => [
  0,
  0,
  DE.listToDeco(decos),
];

const parseAnserColor: Unary<string, ColorBin> = s =>
  s === null || s === undefined
    ? 0
    : color.normalize([
        ...(s.split(',').map(s => parseInt(s)) as Tuple3<number>),
        1,
      ]);

const anserDeco = (anser: AnserJsonEntry) =>
  FN.pipe(
    anser.decorations,
    // ansis library `inverse` ↔ anser library `reverse`
    // we use `inverse`, so we translate when parsing deco
    AR.map(d => (d === 'reverse' ? 'inverse' : d) as AnserDeco),
    AR.filter(DE.isDeco),
  ) as Decoration[];

/**
 * Build a cell style from an ANSI parser style parsed from a string.
 *
 * All decorations found by the parser will be merged into one list.
 * Any colors parsed will be ignored except for the final fg/bg colors.
 *
 */
export const fromParsed: Unary<
  AnserJsonEntry,
  [ColorBin, ColorBin, Deco]
> = entry => [
  parseAnserColor(entry.fg),
  parseAnserColor(entry.bg),
  DE.listToDeco(anserDeco(entry)),
];
