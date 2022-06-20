import { array as AR, function as FN, predicate as PRE } from 'fp-ts';
import { dup } from 'fp-ts-std/Tuple';
import { Unary } from 'util/function';
import { typedFromEntries, typedKeys } from 'util/object';
import { toSnd } from 'fp-ts-std/Tuple';
import { Matrix, parse } from './data';
import { cross } from './data/cross';
import { elbow } from './data/elbow';
import { halftone } from './data/halftone';
import { line } from './data/line';
import { tee } from './data/tee';

const roleToData = {
  hLine: line.horizontal,
  vLine: line.vertical,
  elbow,
  hTee: tee.horizontal,
  vTee: tee.vertical,
  cross,
  halftone,
} as const;

export type BitmapRole = keyof typeof roleToData;

export const bitmapRoles: BitmapRole[] = typedKeys(roleToData) as BitmapRole[];

export const bitmapRole = FN.pipe(
  bitmapRoles,
  AR.map(dup),
  typedFromEntries,
) as {
  [K in BitmapRole]: K;
};

const parseRole: Unary<BitmapRole, [string, Matrix][]> = role =>
  parse(roleToData[role]);

export const parseRoles: FN.Lazy<[BitmapRole, [string, Matrix][]][]> = () =>
  FN.pipe(bitmapRoles, FN.pipe(parseRole, toSnd, AR.map));

export const matchRole =
  <A>(a: A) =>
  <R>({
    hLine,
    vLine,
    elbow,
    hTee,
    vTee,
    cross,
    halftone,
  }: Record<BitmapRole, Unary<A, R>>): Unary<BitmapRole, R> =>
  role =>
    role === 'hLine'
      ? hLine(a)
      : role === 'vLine'
      ? vLine(a)
      : role === 'elbow'
      ? elbow(a)
      : role === 'hTee'
      ? hTee(a)
      : role === 'vTee'
      ? vTee(a)
      : role === 'cross'
      ? cross(a)
      : halftone(a);

export const isLineRole: PRE.Predicate<BitmapRole> = role =>
  role === 'hLine' || role === 'vLine';
