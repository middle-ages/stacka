import { function as FN } from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import { Unary } from 'util/function';
import { fix } from 'util/fix/kind2';
import { HTree, phantoms, Tree, TreeF, TreeURI2 } from './types';

export const treeF = <E, A>([value, nodes]: [E, A[]]): TreeF<E, A> => ({
  value,
  nodes,
  ...phantoms<A, E>(),
});

export const tree =
  <A>(a: A) =>
  (nodes: Tree<A>[]): Tree<A> =>
    fix<TreeURI2, A>(treeF<A, Tree<A>>([a, nodes]));

export const leaf = <A>(a: A): Tree<A> => tree(a)([]);

export const fromNodes = <A>(nodes: Tree<A>[]): Unary<A, Tree<A>> =>
  FN.pipe(nodes, flip(tree));

export const fixTree = <E>(treeF: HTree<E>): Tree<E> => fix(treeF);
