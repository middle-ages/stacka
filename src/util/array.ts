import {
  array as AR,
  function as FN,
  option as OP,
  readonlyArray as RA,
  readonlyNonEmptyArray as NE,
} from 'fp-ts';
import { join, slice } from 'fp-ts-std/ReadonlyArray';
import { Lazy, pipe } from 'fp-ts/lib/function';
import { L } from 'ts-toolbelt';
import { BinaryC, Endo, Unary } from './function';
import { HasKey, pluck } from './object';
import { Pair } from './tuple';

export type SingletonArray = { length: 1 };

export type NEA<T> = NE.ReadonlyNonEmptyArray<T>;

export const last = <T>(arr: T[]): T => arr[arr.length - 1] as T,
  init = <T>(arr: T[]): T[] => arr.slice(0, arr.length - 1),
  initLast = <T>(arr: T[]): [T[], T] => [init(arr), last(arr)];

export const splitN =
  (n: number) =>
  <T>(arr: T[]): [T[], T[]] =>
    [arr.slice(0, n), arr.slice(n, arr.length)];

export const splitFinalN =
  (n: number) =>
  <T>(arr: T[]): [T[], T[]] =>
    [arr.slice(0, arr.length - n), arr.slice(-1 * n, -1)];

export const headLastMain = <T>(arr: T[]): [T, T, T[]] => {
  const [init, last] = initLast(arr);
  const [head, main] = headTail(init);
  return [head, last, main];
};

export const head = <T>(arr: T[]): T => arr[0] as T,
  tail = <T>(arr: T[]): T[] => arr.slice(1, arr.length),
  headTail = <T>(arr: T[]): [T, T[]] => [head(arr), tail(arr)];

function* arrayGen<T>(xs: T[]): Generator<T, undefined, never> {
  for (const x of xs) yield x;
  return undefined;
}
export const toGen = <T>(xs: T[]): Lazy<T | undefined> => {
  const gen = arrayGen(xs);
  return () => gen.next().value;
};

export const zipToObject =
  <KS extends readonly string[]>(keys: KS) =>
  <VS extends readonly any[]>(values: VS): L.ZipObj<KS, VS> => {
    const [keyLen, valueLen] = [keys, values].map(RA.size);
    if (keyLen !== valueLen)
      throw new Error(`|keys|≠|values|: “${keyLen}”≠“${valueLen}”`);

    return pipe(keys, RA.zip(values), Object.fromEntries);
  };

export const checkIndex: BinaryC<number, any[], boolean> = n => g =>
  (g.length ?? 0) > Math.abs(n) + (n < 0 ? 0 : 1);

export const elementAt =
  <N extends number>(n: N) =>
  <A extends any[]>(a: A): A[N] =>
    OP.map(() => a[n < 0 ? a.length - n : n]);

export const splitAt =
  (n: number) =>
  <T>(xs: T[]): [T[], T, T[]] => {
    const len = xs.length;
    if (n < 0) {
      if (len < Math.abs(n))
        throw new Error(`splitAt #xs < |n|: “${len}” < |“${n}”|`);

      return [xs.slice(0, n), xs[len + n] as T, xs.slice(len + n + 1, len)];
    } else {
      if (len <= n) throw new Error(`splitAt #xs ≤ n: “${len}” ≤ “${n}”`);

      return [xs.slice(0, n), xs[n] as T, xs.slice(n + 1)];
    }
  };

export const removeRo = <T>(ts: readonly T[]): T[] => [...ts];
export const mapRemoveRo: <T>(fa: readonly (readonly T[])[]) => T[][] = fa =>
  pipe([...fa], AR.map(removeRo));

export const mapPluck =
  <K extends string>(key: K) =>
  <T extends HasKey<K, T[K]>>(xs: T[]) =>
    pipe(xs, AR.map(pluck(key)));

export const withRowN =
  (n: number) =>
  <A>(f: Endo<A>): Endo<A[]> =>
  xs => {
    const [b, x, a] = splitAt(n)(xs ?? []);
    return [...b, f(x), ...a];
  };

export const withHead = withRowN(0);

export const append =
  <T>(parent: T[]): Unary<T, T[]> =>
  child =>
    [...parent, child];

export const concatPair = <T>([a, b]: Pair<T[]>): T[] => [...a, ...b];

export const emptyJoin: Unary<string[], string> = join('');

export const sliceBy =
  (by: number) =>
  (from: number) =>
  <A>(arr: A[]): A[] =>
    pipe(arr, slice(from)(from + by), removeRo);

export const addAfter =
    <T>(suffix: T[]): Endo<T[]> =>
    xs =>
      [...xs, ...suffix],
  addBefore =
    <T>(prefix: T[]): Endo<T[]> =>
    xs =>
      [...prefix, ...xs],
  addAround =
    <A>([prefix, suffix]: Pair<A[]>): Endo<A[]> =>
    xs =>
      FN.pipe(xs, addBefore(prefix), addAfter(suffix));

export const wrap = <A>([pre, post]: Readonly<Pair<A>>): Endo<A[]> =>
  FN.flow(AR.prepend(pre), AR.append(post));

/** fp-ts zip uses function overloading which breaks uncurrying */
export const zip =
  <B>(bs: Array<B> | Readonly<Array<B>>) =>
  <A>(as: Array<A> | Readonly<Array<A>>): Array<[A, B]> =>
    AR.zip([...as], [...bs]);

export const zipU = <A, B>(bs: Array<B>, as: Array<A>): Array<[A, B]> =>
  AR.zip(as, bs);
