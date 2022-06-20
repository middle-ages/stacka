import {
  array as AR,
  function as FN,
  predicate as PRE,
  readonlyArray as RA,
} from 'fp-ts';
import { zip } from 'util/array';
import { BinaryC, Unary } from 'util/function';
import { pluck, typedFromEntries } from 'util/object';
import { squareMapFst, squareMapSnd } from 'util/tuple';
import { Char } from 'util/string';
import {
  basicBitmaps as borderSetBitmaps,
  BorderSet,
  borderSets,
} from './basicBorderSets';
import { extraGlyphs } from './extraBitmaps';
import { parseBitmap } from './parse';
import { Glyph, GlyphMap, GlyphName, glyphNames } from './types';

const toEntries =
  (glyphs: Glyph[]) =>
  <K extends 'key' | 'char'>(k: K): Record<Glyph[K], Glyph> =>
    FN.pipe(
      glyphs,
      FN.pipe(k, pluck, squareMapFst, RA.map),
      Object.fromEntries,
    );

const glyphsInSet: Unary<BorderSet, Glyph[]> = set =>
  parseBitmap(borderSetBitmaps[set]);

const glyphsBySet: Record<BorderSet, Glyph[]> = FN.pipe(
  borderSets,
  FN.pipe(glyphsInSet, squareMapSnd, AR.map),
  typedFromEntries,
);

// one per border set, provides border parts
const glyphMapOfSet: Unary<BorderSet, GlyphMap> = set =>
  FN.pipe([...glyphNames], FN.pipe(glyphsBySet[set], zip), typedFromEntries);

const makeRegistry = () => {
  const allGlyphs = FN.pipe(glyphsBySet, Object.values, AR.flatten) as Glyph[],
    entries = toEntries([...allGlyphs, ...extraGlyphs]);

  return {
    glyphMap: FN.pipe(
      borderSets,
      FN.pipe(glyphMapOfSet, squareMapSnd, AR.map),
      typedFromEntries,
    ),
    keyMap: entries('key'),
    charMap: entries('char'),
  };
};

const registry = makeRegistry();

export const glyphByName: BinaryC<GlyphName, BorderSet, Glyph> = k => set =>
  registry.glyphMap[set][k];

export const [glyphByChar, glyphByKey]: [
  Unary<Char, Glyph>,
  Unary<string, Glyph>,
] = [k => registry.charMap[k], k => registry.keyMap[k]];

export const hasGlyph: PRE.Predicate<Char> = char =>
  glyphByChar(char) !== undefined;
