import { array as AR, function as FN } from 'fp-ts';
import * as LE from 'monocle-ts/lib/Lens';
import { Lens } from 'monocle-ts/lib/Lens';
import { F, L, O, S } from 'ts-toolbelt';
import { Endo } from 'util/function';
import { split } from 'util/string';
import { pairApply } from 'util/tuple';

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

export const splitValidPath =
  <T extends object>() =>
  <P extends string>(path: AutoPath<T, P>) =>
    FN.pipe(path, split(/\./)) as ValidPath<T, S.Split<P, '.'>>;

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
