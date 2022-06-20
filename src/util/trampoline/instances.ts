import { monoid as MO } from 'fp-ts';
import { Applicative1 } from 'fp-ts/lib/Applicative';
import { Apply1 } from 'fp-ts/lib/Apply';
import { Chain1 } from 'fp-ts/lib/Chain';
import { Foldable1 } from 'fp-ts/lib/Foldable';
import { flip, flow, pipe } from 'fp-ts/lib/function';
import { Functor1 } from 'fp-ts/lib/Functor';
import { Kind, URIS } from 'fp-ts/lib/HKT';
import { Traversable1, Traverse1 } from 'fp-ts/lib/Traversable';
import { apply1, Binary, BinOpC, Unary } from 'util/function';
import { run } from './run';
import { bind, cont, done, Trampoline, URI } from './types';

export const chain =
  <A, B>(f: Unary<B, Trampoline<A, B>>): Unary<Trampoline<B>, Trampoline<A>> =>
  t =>
    bind(t, f);

export const map = <A, B>(
  f: Unary<A, B>,
): Unary<Trampoline<A>, Trampoline<B>> => chain(flow(f, done));

export const ap = <A, B>(
  fab: Trampoline<Unary<A, B>>,
): Unary<Trampoline<A>, Trampoline<B>> =>
  chain(fa => pipe(fab, pipe(fa, apply1, map)));

export const concatFor =
  <A>(M: MO.Monoid<A>): BinOpC<Trampoline<A>> =>
  fa1 =>
    chain(a2 => bind(fa1, a1 => cont(() => done(M.concat(a1, a2)))));

export const reduce = <A, B>(fa: Trampoline<A>, b: B, f: Binary<B, A, B>): B =>
  pipe(
    fa,
    map(a => f(b, a)),
    run,
  );

export const sequence =
  <F extends URIS>(F: Functor1<F>) =>
  <A, B>(tfa: Trampoline<Kind<F, A>, B>): Kind<F, Trampoline<A>> =>
    F.map(run(tfa), a => done(a) as Trampoline<A>);

export const traverse: Traverse1<URI> =
  <F extends URIS>(F: Applicative1<F>) =>
  <A, B>(ta: Trampoline<A>, f: Unary<A, Kind<F, B>>): Kind<F, Trampoline<B>> =>
    pipe(ta, map(f), sequence(F));

export const trampolineMonoid = <A>(
  M: MO.Monoid<A>,
): MO.Monoid<Trampoline<A>> => ({
  concat: (a, b) => pipe(a, concatFor(M)(b)),
  empty: done(M.empty),
});

export const trampolineFoldable: Foldable1<URI> = {
  URI,
  reduce,
  reduceRight: (fa, b, f) => reduce(fa, b, flip(f)),
  foldMap: M => (fa, f) => reduce(pipe(fa, map(f)), M.empty, M.concat),
};

export const trampolineFunctor: Functor1<URI> = {
  URI: URI,
  map: (t, f) => pipe(t, map(f)),
};

export const trampolineApply: Apply1<URI> = {
  ...trampolineFunctor,
  ap: (fab, fa) => pipe(fa, ap(fab)),
};

export const trampolineApplicative: Applicative1<URI> = {
  ...trampolineApply,
  of: done,
};

export const trampolineChain: Chain1<URI> = {
  ...trampolineApply,
  chain: (t, f) => pipe(t, chain(f)),
};

export const trampolineTraverse: Traversable1<URI> = {
  ...trampolineFunctor,
  ...trampolineFoldable,
  traverse,
  sequence,
};
