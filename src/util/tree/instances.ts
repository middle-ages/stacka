import {
  eq as EQ,
  array as AR,
  show as SH,
  applicative as AP,
  apply as APL,
  chain as CH,
  functor as FU,
  function as FN,
} from 'fp-ts';
import { apTree, chainTree, mapTree } from './ops';
import { showTree } from './schemes';
import { tree, Tree, TreeURI } from './TreeF';

const map: FU.Functor1<TreeURI>['map'] = (t, f) => mapTree(f)(t),
  chain: CH.Chain1<TreeURI>['chain'] = (t, f) => chainTree(f)(t),
  ap: APL.Apply1<TreeURI>['ap'] = (t, f) => apTree(t)(f);

export const treeFunctor: FU.Functor1<TreeURI> = {
    URI: TreeURI,
    map,
  },
  treeApply: APL.Apply1<TreeURI> = {
    ...treeFunctor,
    ap,
  },
  treeApplicative: AP.Applicative1<TreeURI> = {
    ...treeApply,
    of: <A>(a: A): Tree<A> => tree(a)([]),
  },
  treeChain: CH.Chain1<TreeURI> = {
    ...treeApplicative,
    chain,
  };

export const getShow = <A>(showA: SH.Show<A>): SH.Show<Tree<A>> => ({
  show: showTree(showA),
});

export const getEq = <A>(eqA: EQ.Eq<A>): EQ.Eq<Tree<A>> => ({
  equals: (
    { unfixed: { value: v1, nodes: nodes1 } },
    { unfixed: { value: v2, nodes: nodes2 } },
  ) =>
    eqA.equals(v1, v2) && FN.pipe(eqA, getEq, AR.getEq).equals(nodes1, nodes2),
});
