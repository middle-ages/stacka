import * as combine from './combine/combine';
import * as registry from './registry';
import * as lens from './lens';
import * as relation from './relation';

export type { CharRelation, Relation, RelationName } from './relation';
export type { MaybeGlyph, Glyph, GlyphRelation, GlyphRelations } from './types';

export const glyphOrSpace = registry.glyphOrSpace;

const fns = {
  ...registry,
  ...combine,
  ...lens,
  ...relation,
  registry,
} as const;

export type glyph = typeof glyphOrSpace & typeof fns;

export const glyph = glyphOrSpace as glyph;

Object.assign(glyph, fns);
