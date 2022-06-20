import { array as AR, function as FN } from 'fp-ts';
import * as LE from 'monocle-ts/lib/Lens';
import { Lens } from 'monocle-ts/lib/Lens';
import { F, L, O, S } from 'ts-toolbelt';
import { Endo, Unary } from 'util/function';
import { Pair, pairApply } from 'util/tuple';

export const propLens =
  <T extends object>() =>
  <K extends keyof T>(k: K): LE.Lens<T, T[K]> =>
    FN.pipe(LE.id<T>(), LE.prop(k));

type Split<P extends string> = S.Split<P, '.'>;
type IsKey<P extends string> = L.Length<Split<P>> extends 1 ? true : false;

/** A valid string path `P` from object `O`  */
export type AutoPath<T extends object, P extends string> = IsKey<P> extends true
  ? Extract<keyof T, string>
  : F.AutoPath<T, P>;

export type ValidPath<
  T extends object,
  P extends L.List<PropertyKey>,
> = F.ValidPath<T, P>;

/** The type at the end of the path `P`, starting from `O` */
export type Resolved<T extends object, P extends string> = O.Path<
  T,
  S.Split<P, '.'>
>;

/** The type of Lens from `O` to `Resolved<O,P>` */
export type PathLens<T extends object, P extends string> = Lens<
  T,
  Resolved<T, P>
>;

export type LensResult<L extends Lens<any, any>> = ReturnType<L['get']>;

/** Given a type, convert a string path in the type to a lens */
export const lensAt =
  <T extends object>() =>
  <P extends string>(path: AutoPath<T, P>) =>
    // Because we typed the `path` arg, we can safely deduce we have a
    // joined path without explaining to Typescript exactly why
    FN.pipe(
      path.split('.').map(p => LE.prop<any, any>(p) as Endo<Lens<any, any>>),
      AR.reduce(LE.id<T>(), FN.untupled(pairApply)),
    ) as unknown as PathLens<T, P>;

/** Flipped compose with better inference */
export const pipeLens =
  <S, A>(sa: Lens<S, A>) =>
  <B>(ab: Lens<A, B>): Lens<S, B> =>
    FN.pipe(sa, LE.compose(ab));

export const composeLensDict =
  <B, K extends string, D extends Record<K, Lens<B, any>>>(dict: D) =>
  <A>(base: Lens<A, B>): { [K in keyof D]: Lens<A, LensResult<D[K]>> } =>
    FN.pipe(
      dict,
      Object.entries,
      AR.map(([key, lens]) => [key, FN.pipe(lens, pipeLens(base))]),
      Object.fromEntries,
    );

/** Extract the getter and setter of a lens */
export const accessPair = <T, R>({
  get,
  set,
}: Lens<T, R>): [Unary<T, R>, Unary<R, Endo<T>>] => [get, set];

/** Convert a pair of lenses into a lens of a pair */
export const pairLens = <T, A, B>([fst, snd]: [Lens<T, A>, Lens<T, B>]): Lens<
  T,
  [A, B]
> => ({
  get: (t: T) => [fst.get(t), snd.get(t)] as [A, B],
  set: ([a, b]: [A, B]) => FN.flow(fst.set(a), snd.set(b)),
});

export const copyFromLensWith =
  <R>(f: Endo<R>) =>
  <T>([fromLens, toLens]: Pair<Lens<T, R>>): Unary<Pair<T>, T> =>
  ([from, to]) =>
    FN.pipe(to, FN.pipe(from, fromLens.get, f, toLens.set));

export const copyFromLens = copyFromLensWith(FN.identity);

export const copyFromWith =
  <R>(f: Endo<R>) =>
  <T>(lens: Lens<T, R>) =>
    copyFromLensWith(f)([lens, lens]);

/**
 * Given a lens `T → R` and a pair of `T`s, get the value whose type is `R` from
 * the first `T`, sets it on the second `T`, and returns it
 */
export const copyFrom = copyFromWith(FN.identity);

/** Sugar for a lense with a built-in modifier */
export interface ModLens<T, R> extends Lens<T, R> {
  mod: Unary<Endo<R>, Endo<T>>;
}

export const modLens = <T, R>(src: Lens<T, R>): ModLens<T, R> => {
  const mod = (f: Endo<R>) => FN.pipe(src, LE.modify(f));
  Object.assign(src, { mod });
  return src as ModLens<T, R>;
};
