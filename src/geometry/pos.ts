import {
  array as AR,
  function as FN,
  monoid as MO,
  number as NU,
  ord as OD,
  predicate as PRE,
  readonlyArray as RA,
  show as SH,
  tuple as TU,
} from 'fp-ts';
import { join } from 'fp-ts-std/Array';
import { curry2, flip, fork } from 'fp-ts-std/Function';
import { add, negate } from 'fp-ts-std/Number';
import { Lens } from 'monocle-ts/lib/Lens';
import { monoOrdStruct } from 'util/fp-ts';
import { Binary, BinaryC, BinOpC, Unary, uncurry2T } from 'util/function';
import { lensAt } from 'util/lens';
import { format, max, min } from 'util/number';
import {
  GetterOf,
  ModifierOf,
  modPropOf,
  setPropOf,
  SetterOf,
  typedValues,
} from 'util/object';
import { Pair, pairCartesian, pairMap, Tuple4 } from 'util/tuple';
import { incSize, size, Size } from './size';

export type Pos = Record<typeof posKeys[number], number>;

export type GetExtrema = Unary<Pos[], Pos>;

const mod = modPropOf<Pos>();

export const posKeys = ['top', 'left'] as const,
  pos: Binary<number, number, Pos> = (top, left) => ({ top, left }),
  posT: Unary<Pair<number>, Pos> = FN.tupled(pos),
  posC: BinaryC<number, number, Pos> = curry2(pos),
  squarePos: Unary<number, Pos> = n => pos(n, n),
  fromTop: Unary<number, Pos> = FN.pipe(0, flip(posC)),
  fromLeft: Unary<number, Pos> = posC(0),
  posPair: Unary<Pos, Pair<number>> = typedValues,
  origin: Pos = pos(0, 0),
  posTopLens: Lens<Pos, number> = lensAt<Pos>()('top'),
  posLeftLens: Lens<Pos, number> = lensAt<Pos>()('left'),
  posTop: GetterOf<Pos, 'top'> = posTopLens.get,
  posLeft: GetterOf<Pos, 'left'> = posLeftLens.get,
  setPosTop: SetterOf<Pos, 'top'> = setPropOf<Pos>()('top'),
  setPosLeft: SetterOf<Pos, 'left'> = setPropOf<Pos>()('left'),
  modPosTop: ModifierOf<Pos, 'top'> = mod('top'),
  modPosLeft: ModifierOf<Pos, 'left'> = mod('left'),
  flipPosH = FN.pipe(negate, mod('left')),
  flipPosV = FN.pipe(negate, mod('top')),
  flipPos = FN.flow(flipPosH, flipPosV),
  addTop: SetterOf<Pos, 'top'> = FN.flow(add, modPosTop),
  addLeft: SetterOf<Pos, 'left'> = FN.flow(add, modPosLeft),
  subTop: SetterOf<Pos, 'top'> = FN.flow(negate, add, modPosTop),
  subLeft: SetterOf<Pos, 'left'> = FN.flow(negate, add, modPosLeft),
  addPos: BinOpC<Pos> = ({ top, left }) => FN.flow(addTop(top), addLeft(left)),
  subPos: BinOpC<Pos> = FN.flow(flipPos, addPos),
  posTopTo: BinOpC<Pos> = FN.flow(posTop, setPosTop),
  posLeftTo: BinOpC<Pos> = FN.flow(posLeft, setPosLeft),
  posOrd: OD.Ord<Pos> = FN.pipe(posKeys, monoOrdStruct(NU.Ord)),
  posEq = curry2(posOrd.equals),
  isOrigin: PRE.Predicate<Pos> = posEq(origin);

const [minTop, minLeft, maxTop, maxLeft] = FN.pipe(
  [
    [posTopLens, posLeftLens],
    [min, max],
  ] as const,
  pairCartesian,
  RA.map(([lens, op]) => FN.flow(AR.map(lens.get), op)),
) as Tuple4<Unary<Pos[], number>>;

export const minPos: Unary<Pos[], Pos> = FN.flow(fork([minTop, minLeft]), posT),
  maxPos: Unary<Pos[], Pos> = FN.flow(fork([maxTop, maxLeft]), posT);

export const showPos: SH.Show<Pos> = {
  show: FN.flow(typedValues, pairMap(format), join(':')),
};

export const posMonoid: MO.Monoid<Pos> = {
  empty: origin,
  concat: uncurry2T(addPos),
};

export const sizeFromOrigin: Unary<Pos, Size> = FN.flow(
  posPair,
  // top/left ⇒ width/height
  TU.swap,
  size,
  incSize,
);

export const sizeFromCorners: Unary<Pair<Pos>, Size> = ([
  topLeft,
  bottomRight,
]) => FN.pipe(bottomRight, subPos(topLeft), sizeFromOrigin);
