import { array as AR, function as FN, option as OP } from 'fp-ts';
import { bitmap, BitmapRole, Matrix } from 'src/bitmap';
import { BinaryC, Unary } from 'util/function';
import {
  RelationOf,
  buildRelationsOf,
  CharRelation,
  CharRelations,
  RelationName,
} from './relation';

/**
 * A “Glyph” is unicode character with some information we have computed about
 * it:
 *
 * 1. The character itself
 * 2. The list of its `BitmapRole`s, for example “┣” is from the bitmap role
 * `vTee`.
 * 3. The glyph bitmap matrix: useful for stacking with other characters or
 * investigating the bitmap itself using the functions in `bitmap/ops`,
 * such as `bitmap.invertEq` to check if a matrix pair are invert symmetric,
 * `bitmap.countPx` to count pixels `ON` in some row given by index,
 * and many others.
 * 4. Relations to other glyphs: a `CharRelations` object encodes relations to
 * other glyphs we have registered, keyed by the relation criteria, I.e.
 * `weight`, `turn`, `invert`, etc. This allows navigation between the glyphs by
 * relation.
 */

export interface Glyph {
  _tag: 'glyph';
  char: string;
  roles: BitmapRole[];
  matrix: Matrix;
  relation: CharRelations;
}

export type MaybeGlyph = OP.Option<Glyph>;

/** A `CharRelation` with the characters replaced by their glyphs */
export type GlyphRelation = RelationOf<Glyph>;

/** All glyph relations of one glyph, by relation name */
export type GlyphRelations = Record<RelationName, GlyphRelation>;

export const buildGlyph: BinaryC<string, CharRelation[], Glyph> =
  char => relations => ({
    _tag: 'glyph',
    char,
    roles: bitmap.rolesByChar(char),
    matrix: bitmap.matrixByChar(char),
    relation: buildRelationsOf(relations),
  });

export const buildGlyphRelations: BinaryC<
  Unary<CharRelation, GlyphRelation>,
  CharRelation[],
  GlyphRelations
> = f => FN.flow(AR.map(f), buildRelationsOf);
