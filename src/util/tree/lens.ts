import { array as AR, function as FN } from 'fp-ts';
import * as LE from 'monocle-ts/Lens';
import { HasTotalKey, pluck } from 'util/object';
import { head, last } from 'util/array';
import { Endo, Unary } from 'util/function';
import { ModLens, modLens } from 'util/lens';
import { treeF } from './build';
import { HTree, Tree, TreeF } from './types';

export const valueF = <E, A>(): ModLens<TreeF<E, A>, E> =>
  FN.pipe(LE.id<TreeF<E, A>>(), LE.prop('value'), modLens);

export const nodesF = <E, A>(): ModLens<TreeF<E, A>, A[]> =>
  FN.pipe(LE.id<TreeF<E, A>>(), LE.prop('nodes'), modLens);

export const getNodesF = <E, A>(tr: TreeF<E, A>): A[] => tr.nodes;

export const unfixed = <A>(): ModLens<Tree<A>, HTree<A>> =>
  FN.pipe(LE.id<Tree<A>>(), LE.prop('unfixed'), modLens);

export const mapValueF =
  <E, F>(f: Unary<E, F>) =>
  <A>(tr: TreeF<E, A>): TreeF<F, A> =>
    treeF([f(tr.value), tr.nodes]);

export const mapNodesF =
  <A, B>(f: Unary<A, B>) =>
  <E>(tr: TreeF<E, A>): TreeF<E, B> =>
    treeF([tr.value, FN.pipe(tr, nodesF<E, A>().get, AR.map(f))]);

export const value = <A>(): ModLens<Tree<A>, A> =>
  FN.pipe(unfixed<A>(), LE.compose(valueF<A, Tree<A>>()), modLens);

export const nodes = <A>(): ModLens<Tree<A>, Tree<A>[]> =>
  FN.pipe(unfixed<A>(), LE.compose(nodesF<A, Tree<A>>()), modLens);

export const getNodes = <A>(tr: Tree<A>): Tree<A>[] => nodes<A>().get(tr);

export const addNode = <A>(n: Tree<A>): Endo<Tree<A>> =>
  FN.pipe(n, AR.append, nodes<A>().mod);

export const addNodes = <A>(ns: Tree<A>[]): Endo<Tree<A>> =>
  nodes<A>().mod(ts => ns.concat(ts));

export const getNodeCount = <A>(t: Tree<A>) => nodes<A>().get(t).length;
export const hasNodes = <A>(t: Tree<A>) => getNodeCount(t) > 0;

export const [headNode, lastNode] = [
  <A>(tree: Tree<A>) => FN.pipe(tree, nodes<A>().get, head),
  <A>(tree: Tree<A>) => FN.pipe(tree, nodes<A>().get, last),
];

export const mapPluckF =
  <K extends string>(key: K) =>
  <A extends HasTotalKey<K, A[K]>, E>(tr: TreeF<E, A>): TreeF<E, A[K]> =>
    FN.pipe(tr, mapNodesF(pluck(key)));
