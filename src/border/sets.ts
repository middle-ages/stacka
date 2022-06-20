import {
  function as FN,
  option as OP,
  readonlyArray as RA,
  tuple as TU,
} from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import { mapOrientDirs } from 'src/orient';
import { Unary } from 'util/function';
import { typedFromEntries } from 'util/object';
import { MaybeChar } from 'util/string';
import { Pair, squareMapSnd } from 'util/tuple';
import { BorderSet, borderSets } from './char';
import { BorderDir, dirToGlyphChar, mapBorderDirs } from './dir';
import { pickDirs } from './transform';
import { Border, monoBorder } from './types';

export const partMapFor: Unary<BorderSet, Record<BorderDir, MaybeChar>> = set =>
  FN.pipe(
    FN.flow(flip(dirToGlyphChar)(set), OP.some),
    squareMapSnd,
    mapBorderDirs,
    typedFromEntries,
  );

export const fromBorderSet: Unary<BorderSet, Border> = FN.flow(
  partMapFor,
  monoBorder,
);

export const [
  thin,
  thick,
  hThick,
  vThick,
  double,
  hDouble,
  vDouble,
  roundedDashed,
] = FN.pipe(borderSets, RA.map(fromBorderSet));

export const [hDashed, vDashed]: Pair<Border> = FN.pipe(
  roundedDashed,
  pickDirs,
  mapOrientDirs,
  TU.swap,
);
