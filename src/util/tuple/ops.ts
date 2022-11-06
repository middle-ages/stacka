import { function as FN } from 'fp-ts';
import { Unary } from 'util/function';
import { Pair, Tuple3, Tuple4 } from './types';

export type WithKeys<K1 extends string, K2 extends string, A, B> = {
  [k in K1]: A;
} & { [k in K2]: B };

export const withKeys =
  <K1 extends string, K2 extends string>(k1: K1, k2: K2) =>
  <A, B>([a, b]: [A, B]) =>
    ({
      [k1]: a,
      [k2]: b,
    } as WithKeys<K1, K2, A, B>);

export const pairApply = <A, B>([a, f]: [A, Unary<A, B>]): B => f(a),
  applyPair = <A, B>([f, a]: [Unary<A, B>, A]): B => f(a);

export const pairFlow = <A, B, C>([f, g]: [Unary<A, B>, Unary<B, C>]): Unary<
    A,
    C
  > => FN.flow(f, g),
  flowPair = <A, B, C>([f, g]: [Unary<B, C>, Unary<A, B>]): Unary<A, C> =>
    FN.flow(g, f);

export const tuple3Map =
  <T, U>(f: Unary<T, U>): Unary<Tuple3<T>, Tuple3<U>> =>
  ([a, b, c]) =>
    [f(a), f(b), f(c)];

export const tuple4Map =
  <T, U>(f: Unary<T, U>): Unary<Tuple4<T>, Tuple4<U>> =>
  ([a, b, c, d]) =>
    [f(a), f(b), f(c), f(d)];

export const pairAp =
  <A, B, C>(f: Unary<A, B>, g: Unary<A, C>): Unary<[A, A], [B, C, B, C]> =>
  ([a, b]) =>
    [f(a), g(a), f(b), g(b)];

export const append =
  <A>(a: A) =>
  <T extends readonly [...any[]]>(tuple: T): readonly [...T, A] =>
    [...tuple, a];

export const flattenPair = <T>([fst, snd]: Pair<Pair<T>>): Tuple4<T> => [
  ...fst,
  ...snd,
];

export const pairCartesian = <A, B, C, D>([[a, b], [c, d]]: readonly [
  readonly [A, B],
  readonly [C, D],
]): [[A, C], [B, C], [A, D], [B, D]] => [
  [a, c],
  [b, c],
  [a, d],
  [b, d],
];
