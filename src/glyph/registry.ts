import assert from 'assert';
import {
  array as AR,
  function as FN,
  nonEmptyArray as NE,
  option as OP,
  record as RC,
  tuple as TU,
} from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { bitmap } from 'src/bitmap';
import { Unary } from 'util/function';
import { pluck } from 'util/object';
import {
  CharRelation,
  createRelations,
  Relation,
  RelationDef,
  RelationName,
} from './relation';
import {
  buildGlyph,
  buildGlyphRelations,
  Glyph,
  GlyphRelation,
  GlyphRelations,
  MaybeGlyph,
} from './types';

type RelationByName = Record<RelationName, Relation>;
type DefByName = Record<RelationName, RelationDef>;
type GlyphByChar = Map<string, Glyph>;

interface Registry {
  allRelations: Relation[];
  allCharRelations: CharRelation[];

  allRelationNames: RelationName[];
  defs: RelationDef[];

  defByName: DefByName;
  relations: RelationByName;
  glyphByChar: GlyphByChar;
}

const makeRegistry: FN.Lazy<Registry> = () => {
  const relCharPairs: [Relation, CharRelation[]][] = createRelations(),
    allRelations: Relation[] = FN.pipe(relCharPairs, AR.map(TU.fst)),
    defs = FN.pipe(allRelations, AR.map(pluck('def'))),
    allRelationNames = FN.pipe(defs, AR.map(pluck('name'))),
    allCharRelations: CharRelation[] = FN.pipe(relCharPairs, AR.chain(TU.snd));

  const charMap = new Map<string, CharRelation[]>();
  for (const charRelation of allCharRelations) {
    const char = charRelation.on;
    charMap.set(char, [...(charMap.get(char) ?? []), charRelation]);
  }

  const glyphByChar = new Map<string, Glyph>();
  charMap.forEach((relations, char) =>
    glyphByChar.set(char, FN.pipe(relations, buildGlyph(char))),
  );

  return {
    allRelations,
    allCharRelations,
    allRelationNames,
    defs,
    defByName: FN.pipe(allRelationNames, AR.zip(defs), RC.fromEntries),
    relations: FN.pipe(allRelationNames, AR.zip(allRelations), RC.fromEntries),
    glyphByChar,
  } as Registry;
};

const reg = makeRegistry();

export const {
  allRelationNames,
  defs,
  defByName,
  relations,
  allCharRelations,
} = reg;

export const glyphByChar: Unary<string, MaybeGlyph> = char =>
  FN.pipe(reg.glyphByChar.get(char), OP.fromNullable);

export const [space, solid] = FN.pipe(
  [' ', bitmap.solid],
  mapBoth(
    FN.flow(glyphByChar, m => {
      assert(OP.isSome(m), 'no space/solid');
      return m.value;
    }),
  ),
);

export const glyphOrSpace: Unary<string, Glyph> = FN.flow(
  glyphByChar,
  FN.pipe(space, FN.constant, OP.getOrElse),
);

const convertRelation: Unary<CharRelation, GlyphRelation> = ({
  on,
  prev,
  next,
  relation,
}) => {
  return {
    on: glyphOrSpace(on),
    relation,
    prev: FN.pipe(prev, AR.map(glyphOrSpace)),
    next: FN.pipe(next, AR.map(glyphOrSpace)),
  };
};

export const glyphRelationsDict: Record<string, GlyphRelations> = FN.pipe(
  allCharRelations,
  NE.groupBy(pluck('on')),
  FN.pipe(convertRelation, buildGlyphRelations, RC.map),
);

export const glyphRelations: Unary<string, GlyphRelation[]> = char =>
  Object.values(glyphRelationsDict[char] ?? []);
