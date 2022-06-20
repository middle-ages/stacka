import { array as AR, either as EI, function as FN, tuple as TU } from 'fp-ts';
import { dup } from 'fp-ts-std/Tuple';
import { pipe } from 'fp-ts/lib/function';
import { L } from 'ts-toolbelt';
import { Unary } from 'util/function';
import { Pair, Tuple3, Tuple4 } from './types';

export const tupleWith =
    <A>(a: A) =>
    <B>(b: B): [A, B] =>
      [a, b],
  leftTupleWith =
    <A>(a: A) =>
    <B>(b: B): [B, A] =>
      [b, a];

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

export const pairApply = <A, B>([a, f]: [A, Unary<A, B>]): B => f(a);
export const applyPair = <A, B>([f, a]: [Unary<A, B>, A]): B => f(a);

export const pairFlow = <A, B, C>([f, g]: [Unary<A, B>, Unary<B, C>]): Unary<
    A,
    C
  > => FN.flow(f, g),
  flowPair = <A, B, C>([f, g]: [Unary<B, C>, Unary<A, B>]): Unary<A, C> =>
    FN.flow(g, f);

export const squareMapFst =
    <A, B>(f: Unary<A, B>) =>
    (a: A): [B, A] =>
      pipe(a, dup, TU.mapFst<A, B>(f)),
  squareMapSnd =
    <A, B>(f: Unary<A, B>) =>
    (a: A): [A, B] =>
      pipe(a, dup, TU.mapSnd<A, B>(f));

export type RoUnionPair<T> =
  | Pair<T>
  | Readonly<Pair<T>>
  | L.Readonly<Pair<T>, 'deep'>;

export const pairMap =
  <T, U>(f: Unary<T, U>) =>
  ([a, b]: RoUnionPair<T>): Pair<U> =>
    [f(a as T), f(b as T)];

export const pairZip = <A, B, C, D>([[a, b], [c, d]]: [[A, B], [C, D]]): [
  [C, A],
  [D, B],
] => [
  [c, a],
  [d, b],
];

export const tuple3Map =
  <T, U>(f: Unary<T, U>): Unary<Tuple3<T>, Tuple3<U>> =>
  ([a, b, c]) =>
    [f(a), f(b), f(c)];

export const pairAp =
  <A, B, C>(f: Unary<A, B>, g: Unary<A, C>): Unary<[A, A], [B, C, B, C]> =>
  ([a, b]) =>
    [f(a), g(a), f(b), g(b)];

export const append =
  <A>(a: A) =>
  <T extends readonly [...any[]]>(tuple: T): readonly [...T, A] =>
    [...tuple, a];

export const tupleLast = <T extends readonly [any, ...any[]]>(
  xs: T,
): L.Last<T> => xs[xs.length - 1];

export const tupleInit = <T extends readonly [any, ...any[]]>(xs: T) =>
  xs.slice(0, xs.length - 1) as L.Pop<T>;

export const tupleTail = <T extends readonly [any, ...any[]]>(xs: T) =>
  xs.slice(1, xs.length) as L.Tail<T>;

/**
 * Create a homogeneous N-tuple of `T`
 *
 * @param n integer repeat count
 * @returns
 * @param o item to repeat
 * @returns N-tuple where the given item is repeated
 *
 * Example:
 *
 * ```Typescript
 * nTuple(3)((n: number) => n + 1 ) ≡ readonly [
 *   (n: number) => n + 1,
 *   (n: number) => n + 1,
 *   (n: number) => n + 1,
 * ] as [
 *   Endomorphism<number>,
 *   Endomorphism<number>,
 *   Endomorphism<number>,
 * ]
 * ```
 */
export const nTuple =
  <N extends number>(n: N) =>
  <T>(o: T) =>
    AR.replicate(n, o) as L.Repeat<T, N>;

type TupleMapper<T extends readonly [...Function[]]> = T extends readonly []
  ? readonly []
  : T extends readonly [infer A, ...any[]]
  ? A extends Unary<infer B, any>
    ? L.Tail<T> extends readonly [...Function[]]
      ? readonly [B, ...TupleMapper<L.Tail<T>>]
      : never
    : never
  : never;

type MapTuple<T extends readonly [...Function[]]> = T extends readonly []
  ? readonly []
  : T extends readonly [infer A, ...any[]]
  ? A extends Unary<any, infer B>
    ? L.Tail<T> extends readonly [...Function[]]
      ? readonly [B, ...MapTuple<L.Tail<T>>]
      : never
    : never
  : never;

/**
 * Run a tuple of functions on a tuple of inputs
 *
 * ```Typescript
 *
 * const bar = [
 *   (n: number): boolean => n === 1,
 *   (s: string): number => s.length,
 * ] as const;
 *
 * const baz: readonly [boolean, number] =
 *     pipe([1, 'foo'] as const, mapTuple(bar));
 * ```
 */
export const mapTuple =
  <U extends readonly [...Function[]]>(funcs: U) =>
  <T extends TupleMapper<U>>(tuple: T): MapTuple<U> => {
    const res = AR.replicate(tuple.length, undefined) as any;
    for (let i = 0; i < tuple.length; i++) {
      res[i] = (funcs[i] as any)(tuple[i]);
    }
    return res;
  };

type _Sequence<E, T extends readonly [...any[]]> = T extends readonly []
  ? []
  : T extends readonly [EI.Either<E, infer A>, ...any[]]
  ? readonly [A, ..._Sequence<E, L.Tail<T>>]
  : never;

/** Result of converting N-tuple of `Either`s into Either of N-tuple */
export type Sequence<
  E,
  T extends readonly [...EI.Either<E, any>[]],
> = EI.Either<E, _Sequence<E, T>>;

/**
 * Convert a pair of “Either”s into an either of a pair
 *
 * @param ab a pair of `EI.Either`s
 * @returns An `EI.Either` of the pair
 *
 * Example:
 *
 * ```Typescript
 * declare const foo: EI.Either<Error, number>;
 * declare const bar: EI.Either<Error, string>;
 *
 * const seq: EI.Either<
 *   Error,
 *   [number, string]
 * > = sequence2([foo, bar]);
 * ```
 */
export const sequence2 = <E, A, B>([a, b]: readonly [
  EI.Either<E, A>,
  EI.Either<E, B>,
]): EI.Either<E, [A, B]> =>
  pipe(
    a,
    EI.chain(a =>
      pipe(
        b,
        EI.chain(b => EI.right([a, b] as [A, B])),
      ),
    ),
  );

/**
 * Convert a 3-tuple of `Either`s into an either of a tuple
 *
 * @param abc a 3-tuple of `EI.Either`s
 * @returns An `EI.Either` of a 3-tuple
 */
export const sequence3 = <E, A, B, C>([a, b, c]: readonly [
  EI.Either<E, A>,
  EI.Either<E, B>,
  EI.Either<E, C>,
]) =>
  pipe(
    a,
    EI.chain(a =>
      pipe(
        b,
        EI.chain(b =>
          pipe(
            c,
            EI.chain(c => EI.right([a, b, c] as [A, B, C])),
          ),
        ),
      ),
    ),
  );

export const flattenFst: <A, B, C>(t: [[A, B], C]) => [A, B, C] = ([
  [a, b],
  c,
]) => [a, b, c];

export const flattenSnd: <A, B, C>(t: [A, [B, C]]) => [A, B, C] = ([
  a,
  [b, c],
]) => [a, b, c];

export const flattenPair = <T>([fst, snd]: Pair<Pair<T>>): Tuple4<T> => [
  ...fst,
  ...snd,
];

export type pairWith = <A, B>([a, b]: [A, B]) => <T>(o: T) => [[A, T], [B, T]];

export const pairWith: pairWith =
  ([a, b]) =>
  o =>
    FN.pipe([b, o] as [typeof b, typeof o], tupleWith([a, o]));

export const pairCartesian = <A, B, C, D>([[a, b], [c, d]]: readonly [
  readonly [A, B],
  readonly [C, D],
]): [[A, C], [B, C], [A, D], [B, D]] => [
  [a, c],
  [b, c],
  [a, d],
  [b, d],
];
