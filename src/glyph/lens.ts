import { array as AR, function as FN, option as OP, record as RC } from 'fp-ts';
import * as LE from 'monocle-ts/Lens';
import { mapBoth } from 'fp-ts-std/Tuple';
import { CharRelation, RelationName } from './relation';
import { BinaryC, Unary } from 'util/function';
import { modLens } from 'util/lens';
import { Pair } from 'util/tuple';
import { glyphByChar } from './registry';
import { Glyph, MaybeGlyph } from './types';
import { pluck } from 'util/object';

const lens = LE.id<Glyph>();

export const char = FN.pipe(lens, LE.prop('char'), modLens),
  roles = FN.pipe(lens, LE.prop('roles'), modLens),
  matrix = FN.pipe(lens, LE.prop('roles'), modLens),
  relation = FN.pipe(lens, LE.prop('relation'), modLens);

export const getRelation: BinaryC<
  RelationName,
  Glyph,
  OP.Option<CharRelation>
> = rel => FN.flow(relation.get, OP.fromNullable, OP.chain(RC.lookup(rel)));

export const [getPrev, getNext]: Pair<
  BinaryC<RelationName, Glyph, OP.Option<string[]>>
> = [
  rel => FN.flow(getRelation(rel), FN.pipe('prev', pluck, OP.map)),
  rel => FN.flow(getRelation(rel), FN.pipe('next', pluck, OP.map)),
];

const nextPrevGlyphs =
  (nav: typeof getPrev): BinaryC<RelationName, MaybeGlyph, Glyph[]> =>
  rel =>
    FN.flow(
      FN.pipe(rel, nav, OP.chain),
      FN.pipe(glyphByChar, AR.map, OP.map),
      OP.chain(AR.sequence(OP.Applicative)),
      OP.getOrElse<Glyph[]>(() => []),
    );

export const [prevGlyphs, nextGlyphs]: Pair<
  BinaryC<RelationName, MaybeGlyph, Glyph[]>
> = FN.pipe([getPrev, getNext], mapBoth(nextPrevGlyphs));

export const [prevChars, nextChars]: Pair<
  BinaryC<RelationName, string, string[]>
> = [
  rel => FN.flow(glyphByChar, prevGlyphs(rel), AR.map(char.get)),
  rel => FN.flow(glyphByChar, nextGlyphs(rel), AR.map(char.get)),
];

export const relationNames: Unary<string, RelationName[]> = FN.flow(
  glyphByChar,
  OP.map(FN.flow(relation.get, RC.keys)),
  OP.getOrElse<RelationName[]>(() => []),
);

export const related: Unary<string, string[]> = s =>
  FN.pipe(
    s,
    relationNames,
    AR.chain(rel => [...prevChars(rel)(s), ...nextChars(rel)(s)]),
  );
