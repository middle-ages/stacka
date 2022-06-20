import {
  array as AR,
  function as FN,
  functor as FU,
  ord as OD,
  predicate as PRE,
  readonlyArray as RA,
  show as SH,
  string as STR,
} from 'fp-ts';
import { sum } from 'fp-ts-std/Array';
import { ana, cata, para, unfix } from 'util/fix/kind2';
import { Endo, Unary, Unary1 } from 'util/function';
import { max } from 'util/number';
import { pluck, typedEntries, typedFromEntries } from 'util/object';
import { fixTree, treeF } from './build';
import * as LN from './lens';
import {
  HTree,
  Tree,
  TreeAlgebra,
  TreeAlgebraOf,
  TreeF,
  TreeURI,
  TreeURI2,
} from './types';

export const treeFunctor2: FU.Functor2<TreeURI2> = {
  URI: TreeURI2,
  map: (t, f) => FN.pipe(t, LN.mapNodesF(f)),
};

export const treeCata = cata(treeFunctor2),
  treeAna = ana(treeFunctor2),
  treePara = para(treeFunctor2);

export const nodeCountAlgebra = <E>(root: TreeF<E, number>): number =>
  sum(root.nodes) + root.nodes.length;

export const nodeCount: Unary1<TreeURI, number> = FN.flow(
  treeCata(nodeCountAlgebra),
  FN.increment,
);

export const maxNodesAlgebra = <E>(root: TreeF<E, number>): number =>
  1 +
  FN.pipe(
    root,
    root.nodes.length > 0
      ? FN.flow(LN.nodesF<E, number>().get, max)
      : FN.constant(0),
  );

export const maxDepth: Unary1<TreeURI, number> = treeCata(maxNodesAlgebra);

export const filterAlgebra =
  <E>(f: PRE.Predicate<Tree<E>>): Unary<HTree<E>, Tree<E>> =>
  ht =>
    FN.pipe(
      ht,
      fixTree,
      FN.pipe(ht, LN.nodesF<E, Tree<E>>().get, AR.filter(f), LN.nodes<E>().set),
    );

export const filterTree = <E>(f: PRE.Predicate<Tree<E>>): Endo<Tree<E>> =>
  FN.pipe(f, filterAlgebra, treeCata);

export const sortAlgebra =
  <E>(o: OD.Ord<E>): Unary<HTree<E>, Tree<E>> =>
  ht =>
    FN.pipe(
      ht,
      fixTree,
      FN.pipe(
        ht.nodes,
        AR.map(unfix),
        FN.pipe(o, OD.contramap<E, HTree<E>>(pluck('value')), AR.sort),
        AR.map(fixTree<E>),
        LN.nodes<E>().set,
      ),
    );

export const sortNodes: <E>(o: OD.Ord<E>) => Endo<Tree<E>> = FN.flow(
  sortAlgebra,
  treeCata,
);

export const flattenNodesAlgebra = <E>(tree: TreeF<E, E[]>): E[] => [
  tree.value,
  ...AR.flatten(tree.nodes),
];

/** top-down depth-first */
export const flattenNodes: <E>(tree: Tree<E>) => E[] =
  treeCata(flattenNodesAlgebra);

export type TreeUnfolder = <T>(value: T) => T[];
export type TreeUnfolderOf<T> = (value: T) => T[];

export const unfoldCoalgebra =
  <T>(unfolder: TreeUnfolderOf<T>) =>
  (t: T): TreeF<T, T> =>
    treeF([t, unfolder(t)]);

export const unfoldTree = <T>(unfolder: TreeUnfolderOf<T>): Unary<T, Tree<T>> =>
  FN.pipe(unfolder, unfoldCoalgebra, treeAna);

export const showAlgebra =
  <A>(showA: SH.Show<A>): TreeAlgebra<A, string> =>
  ({ value, nodes }) =>
    nodes.length
      ? `tree(${showA.show(value)})([${nodes.join(', ')}])`
      : `leaf(${showA.show(value)})`;

export const showTree = <A>(showA: SH.Show<A>): Unary<Tree<A>, string> =>
  FN.pipe(showA, showAlgebra, treeCata);

export const showStringTree: Unary<Tree<string>, string> = FN.pipe(
  STR.Show,
  showAlgebra,
  treeCata,
);

export type AlgebraStruct<T extends {}, A> = {
  [K in keyof T]: TreeAlgebra<T[K], A>;
};

export type AlgebraStructOf<T extends {}> = {
  [K in keyof T]: TreeAlgebraOf<T[K]>;
};

/** Convert struct of algebras ⇒ algebra of structs */
export const mergeAlgebras =
  <T extends {}, A>(struct: AlgebraStruct<T, A>): TreeAlgebra<T, A> =>
  <E>(term: TreeF<E, A>): A => {
    type Key = string & keyof A;
    type AlgebraOf<K extends Key> = TreeAlgebraOf<A[K]>;

    const step = <K extends Key>([key, algebra]: [K, AlgebraOf<K>]): [
      string & K,
      A[K],
    ] => [
      key,
      FN.pipe(pluck(key), x =>
        FN.pipe(term, LN.mapNodesF<A, A[K]>(x), algebra),
      ),
    ];

    return FN.pipe(struct, typedEntries, RA.map(step), typedFromEntries) as A;
  };
