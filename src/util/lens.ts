import { function as FN } from 'fp-ts';
import * as LE from 'monocle-ts/lib/Lens';
import { Lens } from 'monocle-ts/lib/Lens';
import { Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { ByteArray, indexRecord } from './array';
import { fromKeys } from './object';

export type LensResult<L extends Lens<any, any>> = ReturnType<L['get']>;

/** Convert a pair of lenses into a lens of a pair */
export const pairLens = <T, A, B>([fst, snd]: [Lens<T, A>, Lens<T, B>]): Lens<
  T,
  [A, B]
> => ({
  get: (t: T) => [fst.get(t), snd.get(t)] as [A, B],
  set: ([a, b]: [A, B]) => FN.flow(fst.set(a), snd.set(b)),
});

/**
 * Set the `toLens` with a value we get from `fromLens`, after running it
 * through `f`. Both lenses must be of the same type.
 */
export const copyFromLensWith =
  <R>(f: Endo<R>) =>
  <T>([fromLens, toLens]: Pair<Lens<T, R>>): Unary<Pair<T>, T> =>
  ([from, to]) =>
    FN.pipe(to, FN.pipe(from, fromLens.get, f, toLens.set));

/** Sugar for a lense with a built-in modifier */
export interface ModLens<T, R> extends Lens<T, R> {
  mod: Unary<Endo<R>, Endo<T>>;
}

export const modLens = <T, R>(src: Lens<T, R>): ModLens<T, R> => {
  const mod = (f: Endo<R>) => FN.pipe(src, LE.modify(f));
  Object.assign(src, { mod });
  return src as ModLens<T, R>;
};

/**
 * Create lenses for get/set/mod of a component in a fixed size
 * `UInt8ClampedArray`.
 *
 * Example:
 *
 * ```ts
 * import { byteArrayLens } from 'util/lens';
 *
 * const arr = byteArray.from([1, 2, 3]);
 *
 * const keys = ['first', 'second', 'third'] as const;
 *
 * const lens = byteArrayLens(keys);
 *
 * // use the lens to set the key at `third` to 4
 * const newArr = lens.third.set(4)(arr);
 *
 * // newArr = byteArray.from([1, 2, 4])
 *
 * ```
 */
export const byteArrayLens = <K extends string>(
  keys: readonly K[],
): Record<K, ModLens<Uint8ClampedArray, number>> => {
  const index: Record<K, number> = indexRecord(keys);

  const componentLens = (k: K) =>
    modLens<ByteArray, number>({
      get: arr => arr[index[k]],
      set: n => arr => {
        const copy = ByteArray.from(arr);
        copy[index[k]] = n;
        return copy;
      },
    });

  return FN.pipe(componentLens, fromKeys(keys));
};
