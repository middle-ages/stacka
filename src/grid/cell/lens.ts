import { array as AR, function as FN } from 'fp-ts';
import { withSnd } from 'fp-ts-std/Tuple';
import * as LE from 'monocle-ts/lib/Lens';
import stringWidth from 'string-width';
import { Unary } from 'util/function';
import { lensAt, LensResult, ModLens, modLens } from 'util/lens';
import { style as ST, Style, StyleLens, StyleLensKey } from '../style/style';
import { BaseCell, Cell, Cont, Styled } from './types';

export const getWidth: Unary<BaseCell, number> = ({ width }) => width,
  getChar: Unary<Styled, string> = ({ char }) => char;

const lens = lensAt<Styled>();

export const style = FN.pipe(lens('style'), modLens),
  char = FN.pipe(lens('char'), modLens);

export const setChar =
  (c: string) =>
  <C extends Styled>(cell: C) => ({
    ...cell,
    char: c,
    width: stringWidth(c),
  });

export const idx = FN.pipe(lensAt<Cont>()('idx'), modLens);

export type StyleTarget<K extends StyleLensKey> = StyleLens[K] extends ModLens<
  Style,
  infer R
>
  ? R
  : never;

const composeStyleLens = <K extends StyleLensKey>(
  k: K,
): ModLens<Styled, StyleTarget<K>> =>
  FN.pipe(
    style,
    LE.compose(ST.lenses[k] as StyleLens[K] & ModLens<Style, StyleTarget<K>>),
    modLens,
  );

export const lenses = FN.pipe(
  ST.lensNames,
  AR.map(withSnd(composeStyleLens)),
  Object.fromEntries,
) as {
  [K in StyleLensKey]: ModLens<Cell, LensResult<StyleLens[K]>>;
};

export const fgRgb = FN.pipe(style, LE.composeOptional(ST.fgRgb)),
  bgRgb = FN.pipe(style, LE.composeOptional(ST.bgRgb)),
  fgOpacity = FN.pipe(style, LE.composeOptional(ST.fgOpacity)),
  bgOpacity = FN.pipe(style, LE.composeOptional(ST.bgOpacity));

export const getDecorations = FN.flow(style.get, ST.getDecorations),
  hasDecorations = FN.flow(getDecorations, AR.isNonEmpty);
