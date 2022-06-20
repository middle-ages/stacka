import { Pair } from 'util/tuple';
import { Criteria } from '../criteria';
import { Counts } from './counts';
import { allRelationNames, relations } from './defs';

export type RelationName = typeof allRelationNames[number];
export type RelationNamed<N extends RelationName> = typeof relations[N];

export interface RelationDef {
  name: RelationName;
  label?: string;
  note?: string;
  /** Relation membership criteria */
  criteria: Criteria;
}

/**
 * A binary relation between a pair of glyphs, defined by some
 * `RelationDef`
 */
export interface Relation {
  def: RelationDef;
  /** Relation defined by its pairs, other fields are computed */
  pairs: Pair<string>[];
  /** Chains are constructed from transitive relations */
  chains: string[][];
  /** Relation statistics */
  counts: Counts;
}

export interface RelationOf<T> {
  on: T;
  relation: RelationName;
  /** All `prev` links in this relation, for this `T` */
  prev: T[];
  /** All `next` links in this relation, for this `T` */
  next: T[];
}

/**
 * A character in a relation.
 *
 * There is one per `(relation count ˣ char membership in relation)`.
 *
 * If the character appears in more than one chain in the relation, then
 * `prev.length/next.length` could be greater than 1.
 */
export type CharRelation = RelationOf<string>;

/**
 * Maps the relation names where a character appears to the `CharRelation`
 * of the character and the relation.
 *
 * There is one `CharRelations` per character. This is relation info we have for
 * a character.
 */
export type CharRelations = Record<RelationName, CharRelation>;
