import {
  applicative as AP,
  array as AR,
  function as FN,
  hkt as HKT,
  tuple as TU,
} from 'fp-ts';
import { toFst, withFst } from 'fp-ts-std/Tuple';
import { Mapper } from 'util/fp-ts';
import { apply1, Unary } from 'util/function';
import { treeCata } from './schemes';
import { Tree, TreeF, TreeURI } from './types';
import { treeF, fixTree, tree } from './build';

export const mapTree: Mapper<TreeURI> =
  <A, B>(f: Unary<A, B>): Unary<Tree<A>, Tree<B>> =>
  ({ unfixed: { value, nodes } }) =>
    FN.pipe(nodes, FN.pipe(f, mapTree, AR.map), FN.pipe(value, f, tree));

export const mapTreePostOrder: Mapper<TreeURI> =
  <A, B>(f: Unary<A, B>): Unary<Tree<A>, Tree<B>> =>
  ({ unfixed: { value, nodes } }) => {
    const makeTree = FN.pipe(value, f, tree);
    return FN.pipe(nodes, FN.pipe(f, mapTree, AR.map), makeTree);
  };

export const flattenAlgebra = <E>(t: TreeF<Tree<E>, Tree<E>>): Tree<E> => {
  const {
    value: {
      unfixed: { value, nodes: subNodes },
    },
    nodes,
  } = t;
  return tree(value)([...nodes, ...subNodes]);
};

export const flattenTree: <E>(t: Tree<Tree<E>>) => Tree<E> =
  treeCata(flattenAlgebra);

export const chainTree = <A, B>(
  f: Unary<A, Tree<B>>,
): Unary<Tree<A>, Tree<B>> => FN.flow(mapTree(f), flattenTree);

export const apTree = <A, B>(fab: Tree<Unary<A, B>>): Unary<Tree<A>, Tree<B>> =>
  chainTree(fa => FN.pipe(fab, FN.pipe(fa, apply1, mapTree)));

export const traverseTree =
  <F extends HKT.URIS>(F: AP.Applicative1<F>) =>
  <A, B>(f: Unary<A, HKT.Kind<F, B>>) => {
    const traverseF = AR.traverse(F);

    return function self({
      unfixed: { value, nodes },
    }: Tree<A>): HKT.Kind<F, Tree<B>> {
      return F.ap(F.map(f(value), tree), FN.pipe(nodes, traverseF(self)));
    };
  };

export const sequenceTree =
  <F extends HKT.URIS>(F: AP.Applicative1<F>) =>
  <A>(ta: Tree<HKT.Kind<F, A>>): HKT.Kind<F, Tree<A>> =>
    FN.pipe(ta, traverseTree(F)(FN.identity));

export const extendTree =
  <A, B>(f: Unary<Tree<A>, B>): Unary<Tree<A>, Tree<B>> =>
  t =>
    FN.pipe(
      t.unfixed.nodes,
      FN.pipe(f, extendTree, AR.map),
      FN.pipe(t, f, tree),
    );

export const mapNode =
  <A, B>(f: Unary<[A, Tree<B>[]], B>): Unary<Tree<A>, Tree<B>> =>
  (treeA: Tree<A>): Tree<B> => {
    const {
      unfixed: { value, nodes },
    } = treeA;

    return FN.pipe(
      FN.pipe(nodes, FN.pipe(f, mapNode, AR.map), withFst(value)),
      toFst(f),
      TU.mapSnd(TU.snd),
      treeF,
      fixTree,
    );
  };
