import { function as FN, readonlyArray as RA, show as SH } from 'fp-ts';
import { dup } from 'fp-ts-std/Tuple';
import { Unary } from 'util/function';
import { Tuple4 } from 'util/tuple';

export const all = [
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
] as const;

export type Corner = typeof all[number];

export type Cornered<T> = Record<Corner, T>;

export type Corners = Cornered<string>;

export const sym: Corners = {
  topLeft: '↖',
  topRight: '↗',
  bottomLeft: '↙',
  bottomRight: '↘',
};

export const value = FN.pipe(all, RA.map(dup), Object.fromEntries) as {
  [K in Corner]: K;
};

export const check = (d: string): d is Corner => d in sym;

export const [map, zip] = [
  <R>(f: Unary<Corner, R>) => FN.pipe(all, RA.map(f)) as Tuple4<R>,
  <R>(r: Tuple4<R>) => FN.pipe(all, RA.zip(r)) as Tuple4<[Corner, R]>,
];

export const fromTuple = <T>([
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
]: Tuple4<T>): Cornered<T> => ({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
});

export const singleton = <T>(t: T): Cornered<T> => fromTuple([t, t, t, t]);

export const show: SH.Show<Corner> = { show: corner => sym[corner] };
