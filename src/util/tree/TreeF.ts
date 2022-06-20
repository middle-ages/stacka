import { array as AR, function as FN, hkt as HKT } from 'fp-ts';
import { construct, ifElse } from 'fp-ts-std/Function';
import { Algebra, AlgebraOf, Coalgebra, fix, Fix, unfix } from 'util/fix/kind2';
import { Endo, Unary } from 'util/function';
import { HasTotalKey, pluck } from 'util/object';

export const TreeURI2 = Symbol();
export type TreeURI2 = typeof TreeURI2;

export const TreeURI = Symbol();
export type TreeURI = typeof TreeURI;

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    readonly [TreeURI2]: TreeF<E, A>;
  }
}

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [TreeURI]: Tree<A>;
  }
}

/** `Tree<E> ≃ HTree<E>` */
export type Tree<E> = Fix<TreeURI2, E>;
export type HTree<E> = TreeF<E, Tree<E>>;

/**
 * ```ts
 * TreeAlgebra<E, A> ≡ Algebra<'TreeF', E, A>
 *                   ≡ TreeF<E, A> ⇒ A
 * ```
 */
export type TreeAlgebra<E, A> = Algebra<TreeURI2, E, A>;

/** Same as `TreeAlgebra` but `E` is inferred from term */
export type TreeAlgebraOf<A> = AlgebraOf<TreeURI2, A>;

/**
 * ```ts
 * TreeCoalgebra<E, A> ≡ Coalgebra<'TreeF', E, A>
 *                     ≡ A ⇒ TreeF<E, A>
 * ```
 */
export type TreeCoalgebra<E, A> = Coalgebra<TreeURI2, E, A>;

/**
 * A tree class with a value of type `E` and child nodes of type `A`
 *
 * The 1st type param (`E`) is the type of the tree data.
 * E.g.: The list of files found in the directory.
 *
 * The 2nd type param (`A`), is the child node type.
 */
export class TreeF<E, A> implements HKT.HKT2<TreeURI2, E, A> {
  /**
   * Create a new tree from its data and nodes: `[E, A[]] ⇒ TreeF<E, A>`
   *
   * @param value tree data
   * @param nodes tree child list
   */
  constructor(readonly value: E, readonly nodes: A[]) {}

  /** These are added for the benefit of fp-ts HKT mechanism */
  readonly _URI!: TreeURI2;
  readonly _A!: A;
  readonly _E!: E;

  /** Child node count of this node */
  get nodeCount(): number {
    return this.nodes.length;
  }

  /** Returns this tree with its data replaced by the given object */
  setValue = <F>(d: F): TreeF<F, A> => TreeF.of([d, this.nodes]);

  /** Map `f` over the data of this tree */
  mapValue = <F>(f: Unary<E, F>): TreeF<F, A> =>
    TreeF.of([f(this.value), this.nodes]);

  /** Returns this tree with children replaced by the given list */
  setNodes = <B>(nodes: B[]): TreeF<E, B> => TreeF.of([this.value, nodes]);

  /** Returns this tree but with the added node */
  addNode = (node: A) => TreeF.of([this.value, [...this.nodes, node]]);

  /** Returns this tree but with the added nodes */
  addNodes: Unary<A[], TreeF<E, A>> = nodes =>
    this.setNodes(this.nodes.concat(nodes));

  /** Map `f` over every node */
  map = <B>(f: Unary<A, B>): TreeF<E, B> =>
    this.setNodes(FN.pipe(this.nodes, AR.map(f)));

  ifHasNodes = <T>(f: Unary<this, T>, g: Unary<this, T>) =>
    FN.pipe(this, ifElse(f)(g)(FN.flow(pluck('nodes'), AR.isEmpty)));

  /** Create a new TreeF from given value and nodes */
  static of = <E, A>(args: [E, A[]]): TreeF<E, A> => {
    return FN.pipe(args, construct(TreeF));
  };

  static leafOf =
    <A>() =>
    <E>(value: E) =>
      TreeF.of<E, A>([value, []]);
}

export const tree =
  <A>(a: A) =>
  (nodes: Tree<A>[]): Tree<A> =>
    fix<TreeURI2, A>(TreeF.of([a, nodes]));

export const leaf = <A>(a: A): Tree<A> => tree(a)([]);

export const fixTree = <E>(treeF: HTree<E>): Tree<E> => fix(treeF);

export const addNode =
  <A>(node: Tree<A>): Endo<Tree<A>> =>
  tree =>
    fixTree(tree.unfixed.addNode(node));

export const addNodes =
  <A>(nodes: Tree<A>[]): Endo<Tree<A>> =>
  tree =>
    fixTree(tree.unfixed.addNodes(nodes));

export const addNodesF =
  <A>(nodes: A[]) =>
  <E>(tree: TreeF<E, A>): TreeF<E, A> =>
    tree.addNodes(nodes);

export const getValueF = <A, E>(tree: TreeF<E, A>): E => tree.value,
  getNodesF = <A, E>(tree: TreeF<E, A>): A[] => tree.nodes;

export const mapValueF =
  <E, F>(f: Unary<E, F>) =>
  <A>(tree: TreeF<E, A>): TreeF<F, A> =>
    tree.mapValue(f);

export const mapUnfixed =
  <A, B>(f: Unary<A, B>) =>
  <E>(treeF: TreeF<E, A>): TreeF<E, B> =>
    treeF.map(f);

export const getValue = <A>(tree: Tree<A>): A =>
    FN.pipe(tree, unfix, getValueF),
  getNodes = <A>(tree: Tree<A>): Tree<A>[] => FN.pipe(tree, unfix, getNodesF),
  getNodeCount = <A>(tree: Tree<A>): number => FN.pipe(tree, getNodes, AR.size);

export const mapPluckF =
  <K extends string>(key: K) =>
  <A extends HasTotalKey<K, A[K]>, E>(tree: TreeF<E, A>): TreeF<E, A[K]> =>
    tree.map(pluck(key));
