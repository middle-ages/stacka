import assert from 'assert';
import {
  array as AR,
  function as FN,
  option as OP,
  readonlyNonEmptyArray as NE,
} from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import { dup, mapBoth } from 'fp-ts-std/Tuple';
import { Lazy } from 'fp-ts/lib/function';
import { Endo, Unary } from 'util/function';
import { Pair, Tuple3 } from 'util/tuple';

export type map2 = <A, B>(f: Unary<A, B>) => Unary<A[][], B[][]>;
export const map2: map2 = FN.flow(AR.map, AR.map);

export const last = <T>(arr: T[]): T => arr[arr.length - 1] as T,
  init = <T>(arr: T[]): T[] => arr.slice(0, arr.length - 1),
  initLast = <T>(arr: T[]): [T[], T] => [init(arr), last(arr)];

export const splitN =
  (n: number) =>
  <T>(arr: T[]): [T[], T[]] =>
    [arr.slice(0, n), arr.slice(n)];

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

export const toCyclicGen = <T>(xs: T[]): Lazy<T> => {
  let gen = arrayGen(xs);
  return () => {
    const value = gen.next().value;
    if (value !== undefined) return value;
    gen = arrayGen(xs);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return gen.next().value!;
  };
};

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

/**
 * Map a function over the grid cells of a rectangle defined by the given
 * position and size. The given function will be called with the index of the
 * row inside the rectangle that is being mapped over.
 **/
export const modSubgrid =
  ([top, left]: Pair<number>, [width, height]: Pair<number>) =>
  <T>(f: Unary<number, Endo<T[]>>): Endo<T[][]> =>
  grid => {
    const threeSlice =
      ([fstCut, size]: Pair<number>) =>
      <S>(xs: S[]) =>
        [
          xs.slice(0, fstCut),
          xs.slice(fstCut, fstCut + size),
          xs.slice(fstCut + size),
        ] as Tuple3<S[]>;

    const [pre, mid, post] = FN.pipe(grid, threeSlice([top, height]));

    const midRes = FN.pipe(
      mid,
      AR.mapWithIndex((idx, cells: T[]) => {
        const [pre, mid, post] = FN.pipe(cells, threeSlice([left, width]));
        return [...pre, ...f(idx)(mid), ...post];
      }),
    );

    return [...pre, ...midRes, ...post];
  };

/**
 * Repeat a subgrid as many time as required to fill the given area.
 *
 * If the given area is smaller than the given subgrid, we chop it.
 */
export const repeatSubgrid =
  ([width, height]: Pair<number>) =>
  <T>(from: T[][]): T[][] => {
    if (height === 0) return [];

    const fromHeight = from.length;
    assert(fromHeight > 0, `repeating empty subgrid: ${fromHeight}`);

    const fromWidth = from[0].length;
    assert(fromWidth > 0, `repeating empty subgrid row: ${fromWidth}`);

    const [widthN, heightN] = FN.pipe(
        [width / fromWidth, height / fromHeight],
        mapBoth(Math.floor),
      ),
      [widthRem, heightRem] = [
        width - widthN * fromWidth,
        height - heightN * fromHeight,
      ];

    const repeatRow: Endo<T[]> = row =>
      fromWidth === width
        ? row
        : fromWidth > width
        ? row.slice(0, width)
        : [...AR.flatten(AR.replicate(widthN, row)), ...row.slice(0, widthRem)];

    const body = height < fromHeight ? [] : FN.pipe(from, AR.map(repeatRow)),
      rem = FN.pipe(from.slice(0, heightRem), AR.map(repeatRow));

    return [...AR.flatten(AR.replicate(heightN, body)), ...rem];
  };

const zipAll = <U, V>(u: U[], v: V[]): [OP.Option<U>, OP.Option<V>][] => {
  const max = Math.max(u.length, v.length),
    delta = AR.replicate(max - Math.min(u.length, v.length), OP.none);

  const [opU, opV]: [OP.Option<U>[], OP.Option<V>[]] = [
    FN.pipe(u, AR.map(OP.some), arr =>
      u.length === max ? arr : [...arr, ...delta],
    ),
    FN.pipe(v, AR.map(OP.some), arr =>
      v.length === max ? arr : [...arr, ...delta],
    ),
  ];
  return zipU(opV, opU);
};

export const chunksOf =
  (n: number) =>
  <T>(ts: T[]) =>
    FN.pipe(ts, AR.chunksOf(n)) as T[][];

/**
 * Chunk a matrix into 2x2 adjacent squares.
 *
 * Convert a 2D matrix of `T` into a 2D matrix of `Pair<Pair<T>>`.
 *
 * There will be ¼th cells in the new matrix. Each cell will be a pair of colums
 * with two cells each, one for each row.
 *
 * Cells are in a `Some` value. If the original grid is not divisible by four,
 * there will also some `None` values.
 */
export const chunk4x = <T>(rows: T[][]): Pair<Pair<OP.Option<T>>>[][] => {
  // each pair is the char in the row + the char below it
  const rowPairs = FN.pipe(
    rows,
    chunksOf(2),
    AR.map(p => (p.length === 2 ? p : [head(p), []])),
  ) as Pair<T[]>[];

  // each pair is the char in the row + the char below it
  const cellPairs: Pair<OP.Option<T>>[][] = FN.pipe(
    rowPairs,
    AR.map(FN.tupled(zipAll)),
  );

  return FN.pipe(
    cellPairs,
    AR.map(
      FN.flow(
        chunksOf(2),
        AR.map(p => (p.length === 2 ? p : [head(p), dup(OP.none)])),
      ),
    ),
  ) as Pair<Pair<OP.Option<T>>>[][];
};

export const mapRange =
  <R>(f: Unary<number, R>): Unary<Pair<number>, R[]> =>
  range =>
    FN.pipe([...NE.range(...range)], AR.map(f));

type Entry<T> = [target: T, prevNext: Pair<T[]>];

export const withAdjacent = <T>(chain: T[]): Entry<T>[] => {
  if (chain.length === 2)
    return [
      [head(chain), [[], [last(chain)]]],
      [last(chain), [[head(chain)], []]],
    ];

  /**
   * ```txt
   *               rem   mapped  rem
   *
   *     before       | A B C | D E
   *     at    →    A | B C D | E
   *     after    A B | C D E |
   *
   * ```
   */
  const [before, at, after]: Tuple3<T[]> = FN.pipe(
    chain,
    fork([FN.flow(init, init), FN.flow(init, tail), FN.flow(tail, tail)]),
  );

  return [
    [head(chain), [[], [head(at)]]],

    ...FN.pipe(
      before,
      AR.zip(after),
      AR.zip(at),
      AR.map<[Pair<T>, T], Entry<T>>(([[prev, next], at]) => [
        at,
        [[prev], [next]],
      ]),
    ),

    [last(chain), [[last(at)], []]],
  ];
};
