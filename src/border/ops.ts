import {
  array as AR,
  function as FN,
  nonEmptyArray as NEA,
  number as NU,
  option as OP,
} from 'fp-ts';
import { maximum } from 'fp-ts-std/Array';
import { fork, uncurry2 } from 'fp-ts-std/Function';
import { add } from 'fp-ts-std/Number';
import { mapBoth } from 'fp-ts-std/Tuple';
import * as backdrop from 'src/backdrop';
import { bitmap } from 'src/bitmap';
import { box } from 'src/box';
import { Corner } from 'src/geometry';
import * as grid from 'src/grid';
import { Endo, Unary } from 'util/function';
import { Pair, pairFlow } from 'util/tuple';
import * as edge from './edge';
import * as part from './part';
import { Border } from './types';

export const roundCorner: Unary<Corner, Endo<Border>> = c =>
  FN.pipe(
    {
      backdrop: FN.pipe(bitmap.round[c], grid.parseRow, backdrop.center),
      width: 1,
      height: 1,
    },
    box,
    part.setPart(c),
  );

const roundCornerPair: Unary<Pair<Corner>, Endo<Border>> = FN.flow(
  mapBoth(roundCorner),
  pairFlow,
);

export const [roundTopCorners, roundBottomCorners]: Pair<Endo<Border>> =
    FN.pipe(
      [
        ['topLeft', 'topRight'],
        ['bottomLeft', 'bottomRight'],
      ],
      mapBoth(roundCornerPair),
    ),
  [roundLeftCorners, roundRightCorners]: Pair<Endo<Border>> = FN.pipe(
    [
      ['topLeft', 'bottomLeft'],
      ['topRight', 'bottomRight'],
    ],
    mapBoth(roundCornerPair),
  );

export const roundCorners = FN.flow(roundTopCorners, roundBottomCorners);

export const [width, height]: Pair<Unary<Border, number>> = [
  br => FN.pipe(br, fork([edge.leftWidth, edge.rightWidth]), uncurry2(add)),
  br => FN.pipe(br, fork([edge.topHeight, edge.bottomHeight]), uncurry2(add)),
];

export const maxWidth: Unary<Border[], number> = FN.flow(
  AR.map(width),
  NEA.fromArray,
  OP.fold(FN.constant(0), maximum(NU.Ord)),
);
