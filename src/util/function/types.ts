import { FunctionN } from 'fp-ts/function';
import { Endomorphism } from 'fp-ts/lib/Endomorphism';
import { Kind, URIS } from 'fp-ts/lib/HKT';

export type EndoOf<T> = <U extends T>(src: U) => U;
export type Endo<T> = Endomorphism<T>;

export type Unary<Q, R> = FunctionN<[Q], R>;
export type UnaryRest<Q, R> = (...args: Q[]) => R;
export type Unary1<F extends URIS, R> = <A>(fa: Kind<F, A>) => R;

export type Binary<P, Q, R> = FunctionN<[P, Q], R>;
export type BinaryC<P, Q, R> = Unary<P, Unary<Q, R>>;

export type BinOp<P> = Binary<P, P, P>;
export type BinOpC<P> = BinaryC<P, P, P>;
export type BinOpT<P> = Unary<[P, P], P>;

export type Ternary<S, P, Q, R> = FunctionN<[S, P, Q], R>;

export type Effect<T> = Unary<T, void>;
