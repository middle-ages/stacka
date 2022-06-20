import { hkt as HKT } from 'fp-ts';
import {
  Algebra,
  AlgebraOf,
  Coalgebra,
  Fix,
  RAlgebra,
  RAlgebraOf,
} from 'util/fix/kind2';

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
 * A Nary-tree class with a value of type `E` and child nodes of type `A`
 *
 * The 1st type param (`E`) is the type of the tree data.
 * E.g.: The list of files found in the directory.
 *
 * The 2nd type param (`A`), is the child node type. Using the `Fix` type, this
 * could be the tree type itself.
 *
 */
export interface TreeF<E, A> extends HKT.HKT2<TreeURI2, E, A> {
  /** Tree node value type */
  value: E;
  /** List of child nodes */
  nodes: A[];

  /** Added for the benefit of fp-ts HKT mechanism */
  readonly _URI: TreeURI2;
  readonly _A: A;
  readonly _E: E;
}

/**
 * ```txt
 * TreeAlgebra<E, A> ≡ Algebra<'TreeF', E, A>
 *                   ≡ TreeF<E, A> ⇒ A
 *
 * cata ≡ TreeAlgebra<E, A> ⇒ Tree<E> ⇒ A
 * ```
 */
export type TreeAlgebra<E, A> = Algebra<TreeURI2, E, A>;

/** Same as `TreeAlgebra` but `E` is inferred from term */
export type TreeAlgebraOf<A> = AlgebraOf<TreeURI2, A>;

/**
 * ```txt
 * TreeCoalgebra<E, A> ≡ Coalgebra<'TreeF', E, A>
 *                     ≡ A ⇒ TreeF<E, A>
 * ```
 */
export type TreeCoalgebra<E, A> = Coalgebra<TreeURI2, E, A>;

/**
 * ```txt
 * TreeRAlgebra<E, A> ≡ RAlgebra<'TreeF', E, A>
 *                    ≡ TreeF<E, [Tree<E>, A>] ⇒ A
 *
 * para ≡ TreeRAlgebra<E, A> ⇒ Tree<E> ⇒ A
 * ```
 */
export type TreeRAlgebra<E, A> = RAlgebra<TreeURI2, E, A>;

/** Same as `TreeRAlgebra` but `E` is inferred from term */
export type TreeRAlgebraOf<A> = RAlgebraOf<TreeURI2, A>;

export const phantoms = <A, E>() =>
  ({ _A: undefined as unknown, _E: undefined as unknown } as {
    readonly _URI: TreeURI2;
    readonly _A: A;
    readonly _E: E;
  });
