import { option as OP } from 'fp-ts';
import { Block, BlockArgs } from 'src/block';
import { BinOpC, BinOpT, Endo, Unary } from 'util/function';
import {
  HTree,
  Tree,
  TreeAlgebra,
  TreeCoalgebra,
  TreeF,
  TreeRAlgebra,
} from 'util/tree';

/** `Box ≃ HBox ≃ BoxOf<Box>` */
export type Box = Tree<Block>;
export type HBox = HTree<Block>;

/** Useful for box cata */
export type BoxOf<A> = TreeF<Block, A>;

export type BoxGet<R> = Unary<Box, R>;
export type BoxSet<R> = Unary<R, Endo<Box>>;
export type BoxMod<R> = Unary<Endo<R>, Endo<Box>>;

export interface BoxArgs extends BlockArgs {
  /** Optionally use an existing block as box content */
  block?: Block;
  /** Optionally include a list of child boxes */
  nodes?: Box[];
  /** Apply a `Box⇒Box` function on the box after creation */
  apply?: Endo<Box>;
}

/** Tupled version of binary placement op */
export type OpT = BinOpT<Box>;

/** Curried version of binary placement op */
export type OpC = BinOpC<Box>;

/** A function that folds a list of boxes into one */
export type Cat = Unary<Box[], Box>;

export type MaybeBox = OP.Option<Box>;

/** Box constructor type */
export type BuildBox = Unary<BoxArgs, Box>;

/**
 * ```txt
 * BoxAlgebra<A> ≡ BoxOf<A> ⇒ A
 *
 * cata ≡ (BoxOf<A> ⇒ A) => Box ⇒ A
 * ```
 */
export type BoxAlgebra<A> = TreeAlgebra<Block, A>;

/**
 * ```txt
 * BoxCoalgebra<A> ≡ A ⇒ BoxOf<A>
 *
 * ana ≡ (A ⇒ BoxOf<A>) => A ⇒ Box
 * ```
 */
export type BoxCoalgebra<A> = TreeCoalgebra<Block, A>;

/**
 * ```txt
 * BoxRAlgebra<A> ≡ BoxOf<[Box, A]> ⇒ A
 *
 * para ≡ (BoxOf<[Box,A]> ⇒ A) => Box ⇒ A
 * ```
 */
export type BoxRAlgebra<A> = TreeRAlgebra<Block, A>;
