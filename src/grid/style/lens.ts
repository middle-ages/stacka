import {
  array as AR,
  function as FN,
  option as OP,
  predicate as PRE,
} from 'fp-ts';
import * as LE from 'monocle-ts/lib/Lens';
import { Optional } from 'monocle-ts/lib/Optional';
import { Color, color, OpacityLevel } from 'src/color';
import { Endo, Unary } from 'util/function';
import { lensAt, modLens } from 'util/lens';
import { typedKeys } from 'util/object';
import { Pair, Tuple3 } from 'util/tuple';
import { Decoration, Style } from './types';

const lens = lensAt<Style>();

export const fg = FN.pipe(lens('fg'), modLens),
  bg = FN.pipe(lens('bg'), modLens);

export const bold = FN.pipe(lens('bold'), modLens),
  italic = FN.pipe(lens('italic'), modLens),
  underline = FN.pipe(lens('underline'), modLens),
  inverse = FN.pipe(lens('inverse'), modLens),
  strikethrough = FN.pipe(lens('strikethrough'), modLens);

export const lenses = {
  fg,
  bg,
  bold,
  italic,
  underline,
  inverse,
  strikethrough,
} as const;

export type StyleLens = typeof lenses;

export const lensNames = typedKeys(lenses);

export type StyleLensKey = keyof StyleLens;

export const [fgRgb, bgRgb]: Pair<Optional<Style, Tuple3<number>>> = [
    FN.pipe(fg, LE.composeOptional(color.maybeRgb)),
    FN.pipe(bg, LE.composeOptional(color.maybeRgb)),
  ],
  [fgOpacity, bgOpacity]: Pair<Optional<Style, number>> = [
    FN.pipe(fg, LE.composeOptional(color.maybeOpacity)),
    FN.pipe(bg, LE.composeOptional(color.maybeOpacity)),
  ];

export const unsetFg = fg.set(OP.none),
  unsetBg = bg.set(OP.none),
  unsetColor = FN.flow(unsetFg, unsetBg);

export const setFg: Unary<Color, Endo<Style>> = FN.flow(OP.some, fg.set),
  setBg: Unary<Color, Endo<Style>> = FN.flow(OP.some, bg.set);

export const [setFgOpacity, setBgOpacity]: Pair<
  Unary<OpacityLevel, Endo<Style>>
> = [
  FN.flow(color.opacityLevelAt, fgOpacity.set),
  FN.flow(color.opacityLevelAt, bgOpacity.set),
];

export const [opaqueFg, transparentFg] = [
    setFgOpacity('opaque'),
    setFgOpacity('transparent'),
  ],
  [opaqueBg, transparentBg] = [
    setBgOpacity('opaque'),
    setBgOpacity('transparent'),
  ],
  [opaque, transparent] = [
    FN.flow(opaqueFg, opaqueBg),
    FN.flow(transparentFg, transparentBg),
  ];

export const getDecorations: Unary<Style, Decoration[]> = ({
    bold,
    italic,
    underline,
    inverse,
    strikethrough,
  }) => [
    ...(bold ? ['bold' as const] : []),
    ...(italic ? ['italic' as const] : []),
    ...(underline ? ['underline' as const] : []),
    ...(inverse ? ['inverse' as const] : []),
    ...(strikethrough ? ['strikethrough' as const] : []),
  ],
  hasDecorations = FN.flow(getDecorations, AR.isNonEmpty);

export const isEmpty: PRE.Predicate<Style> = st =>
  !hasDecorations(st) && OP.isNone(st.fg) && OP.isNone(st.bg);
