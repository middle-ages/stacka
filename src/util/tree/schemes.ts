import {
  array as AR,
  function as FN,
  functor as FU,
  predicate as PRE,
  readonlyArray as RA,
  show as SH,
  string as STR,
} from 'fp-ts';
import { sum } from 'fp-ts-std/Array';
import { ana, cata, fix } from 'util/fix/kind2';
import { Endo, Unary, Unary1 } from 'util/function';
import { max } from 'util/number';
import { typedFromEntries, pluck, typedEntries } from 'util/object';
import {
  getNodesF,
  HTree,
  Tree,
  TreeAlgebra,
  TreeAlgebraOf,
  TreeF,
  TreeURI,
  TreeURI2,
} from './TreeF';

export const treeFunctor2: FU.Functor2<TreeURI2> = {
  URI: TreeURI2,
  map: (t, f) => t.map(f),
};

export const treeCata = cata(treeFunctor2);
export const treeAna = ana(treeFunctor2);

export const nodeCountAlgebra = <E>(root: TreeF<E, number>): number =>
  sum(root.nodes) + root.nodeCount;

export const nodeCount: Unary1<TreeURI, number> = FN.flow(
  treeCata(nodeCountAlgebra),
  FN.increment,
);

export const maxNodesAlgebra = <E>(root: TreeF<E, number>): number =>
  1 + root.ifHasNodes(FN.constant(0), FN.flow(getNodesF, max));

export const maxDepth: Unary1<TreeURI, number> = treeCata(maxNodesAlgebra);

export const filterAlgebra =
  <E>(f: PRE.Predicate<Tree<E>>): Unary<HTree<E>, Tree<E>> =>
  tree =>
    fix(FN.pipe(tree.nodes, AR.filter(f), tree.setNodes));

export const filterTree = <E>(f: PRE.Predicate<Tree<E>>): Endo<Tree<E>> =>
  FN.pipe(f, filterAlgebra, treeCata);

export const flattenNodesAlgebra = <E>(tree: TreeF<E, E[]>): E[] => [
  tree.value,
  ...FN.pipe(tree.nodes, AR.flatten),
];

/** top-down depth-first */
export const flattenNodes: <E>(tree: Tree<E>) => E[] =
  treeCata(flattenNodesAlgebra);

export type TreeUnfolder = <T>(value: T) => T[];
export type TreeUnfolderOf<T> = (value: T) => T[];

export const unfoldCoalgebra =
  <T>(unfolder: TreeUnfolderOf<T>) =>
  (t: T): TreeF<T, T> =>
    TreeF.of([t, unfolder(t)]);

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
    ] => [key, FN.pipe(pluck(key), x => algebra(term.map(x)))];
    //     FN.pipe(key, squareMapSnd(FN.flow(pluck, x => algebra(term.map(x)))));

    return FN.pipe(struct, typedEntries, RA.map(step), typedFromEntries) as A;
  };
