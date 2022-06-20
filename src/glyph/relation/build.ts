import { function as FN, array as AR } from 'fp-ts';
import { pluck, typedFromEntries } from 'util/object';
import { BinaryC, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { toFst, toSnd } from 'fp-ts-std/Tuple';
import { extractChains } from '../criteria';
import { relationCounts } from './counts';
import {
  CharRelations,
  CharRelation,
  Relation,
  RelationDef,
  RelationName,
  RelationOf,
} from './types';

export const buildWithChains: BinaryC<
  RelationDef,
  [Pair<string>[], string[][]],
  Relation
> =
  def =>
  ([pairs, chains]) => ({
    def,
    pairs,
    chains,
    counts: relationCounts(pairs, chains),
  });

export const buildRelation: BinaryC<
  RelationDef,
  Pair<string>[],
  Relation
> = def => FN.flow(toSnd(extractChains), buildWithChains(def));

export const buildCharRelation =
  (on: string, relation: RelationName): Unary<Pair<string[]>, CharRelation> =>
  ([prev, next]) => ({
    on,
    relation,
    prev,
    next,
  });

// :
export const buildRelationsOf = <T>(
  rel: RelationOf<T>[],
): Record<RelationName, RelationOf<T>> =>
  FN.pipe(rel, AR.map(toFst(pluck('relation'))), typedFromEntries);

export const buildCharRelations: Unary<CharRelation[], CharRelations> =
  buildRelationsOf;
