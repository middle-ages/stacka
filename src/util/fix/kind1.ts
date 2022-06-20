import {
  eq as EQ,
  function as FN,
  functor as FU,
  hkt as HKT,
  tuple as TU,
} from 'fp-ts';
import { curry2 } from 'fp-ts-std/Function';
import { Unary } from 'util/function';
import { pluck } from 'util/object';

/**
 * The higher-kinded type at URI `F` with its type parameter set on the
 * fixed-point type `Fix<F>`
 */
export type HFix<F extends HKT.URIS> = HKT.Kind<F, Fix<F>>;

/** `Fix<F> ≃ Kind<F, Fix<F>>` */
export interface Fix<F extends HKT.URIS> {
  readonly unfixed: HFix<F>;
}

export type Algebra<F extends HKT.URIS, A> = Unary<HKT.Kind<F, A>, A>;
export type Coalgebra<F extends HKT.URIS, A> = Unary<A, HKT.Kind<F, A>>;

export type AlgebraOf<F extends HKT.URIS> = <A>(fa: HKT.Kind<F, A>) => A;

export const fix: <F extends HKT.URIS>(f: HFix<F>) => Fix<F> = unfixed => ({
    unfixed,
  }),
  unfix: <F extends HKT.URIS>(fixed: Fix<F>) => HFix<F> = pluck('unfixed');

export type EqFix = <F extends HKT.URIS>(eq: EQ.Eq<HFix<F>>) => EQ.Eq<Fix<F>>;

export const eqFix: EqFix = FN.pipe('unfixed', pluck, EQ.contramap);

export const cata =
  <F extends HKT.URIS>(functor: FU.Functor1<F>) =>
  <A>(algebra: Algebra<F, A>) => {
    return function self(term: Fix<F>): A {
      const before: HKT.Kind<F, Fix<F>> = term.unfixed,
        after: HKT.Kind<F, A> = functor.map(before, self);
      return algebra(after);
    };
  };

export const ana =
  <F extends HKT.URIS>(functor: FU.Functor1<F>) =>
  <A>(coalgebra: Coalgebra<F, A>): Unary<A, Fix<F>> =>
    function self(term): Fix<F> {
      return FN.pipe(self, FN.pipe(term, coalgebra, curry2(functor.map)), fix);
    };

export const hylo =
  <F extends HKT.URIS>(F: FU.Functor1<F>) =>
  <A, B>(algebra: Algebra<F, B>, coalgebra: Coalgebra<F, A>) =>
    function self(term: A): B {
      return algebra(F.map(coalgebra(term), self));
    };

/** Fuse two algbras */
export const zipAlgebras =
  <F extends HKT.URIS>(F: FU.Functor1<F>) =>
  <A, B>(fst: Algebra<F, A>, snd: Algebra<F, B>): Algebra<F, [A, B]> =>
  term =>
    [FN.pipe(F.map(term, TU.fst), fst), FN.pipe(F.map(term, TU.snd), snd)];
