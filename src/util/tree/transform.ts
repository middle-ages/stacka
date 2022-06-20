import { array as AR, function as FN } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import { addAfter, append } from 'util/array';
import { zipAlgebrasU } from 'util/fix/kind2';
import { applyPair, Pair } from 'util/tuple';
import { getIdF, IdAlgebraOf } from './idTree';
import { getNodesF, mapPluckF } from './lens';
import { treeFunctor2 } from './schemes';
import { TreeAlgebra, TreeAlgebraOf } from './types';

export type SeqAlgebra<A> = TreeAlgebra<A, number[]>;
export type SeqAlgebraOf = TreeAlgebraOf<number[]>;

export const depth: SeqAlgebraOf = FN.flow(
  getNodesF,
  AR.flatten,
  AR.map(FN.increment),
  addAfter([0]),
);

export const degree: SeqAlgebraOf = FN.flow(
  getNodesF,
  fork([FN.flow(AR.flatten, append), AR.size]),
  applyPair,
);

export const preorder: TreeAlgebraOf<Pair<number[]>> = zipAlgebrasU(
  treeFunctor2,
)(depth, degree);

export const nodeId: IdAlgebraOf<number[]> = FN.flow(
  fork([FN.flow(getNodesF, AR.flatten, append), getIdF]),
  applyPair,
);

export type PreorderKey = 'depth' | 'degree' | 'nodeId';

export type PreorderId = Record<PreorderKey, number[]>;

export const preorderId: IdAlgebraOf<PreorderId> = term => ({
  depth: FN.pipe(term, mapPluckF('depth'), depth),
  degree: FN.pipe(term, mapPluckF('degree'), degree),
  nodeId: FN.pipe(term, mapPluckF('nodeId'), nodeId),
});
