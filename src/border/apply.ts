import {
  array as AR,
  function as FN,
  option as OP,
  readonlyArray as RA,
} from 'fp-ts';
import { isPositive } from 'fp-ts-std/Number';
import { toSnd } from 'fp-ts-std/Tuple';
import { Box, box, MaybeBox } from 'src/box';
import { borderDir, BorderDir, Bordered, Size, size } from 'src/geometry';
import { BinaryC, Endo, Unary } from 'util/function';
import { typedFromEntries } from 'util/object';
import * as edge from './edge';
import { sets } from './sets';
import { Border, BorderName, borderNames } from './types';

// compute border part from the target box and border definition
const partSizes: BinaryC<Border, Box, Bordered<Size>> = br => target => {
  const [{ left, right, top, bottom }, { width, height }] = [
    edge.edgeSizes(br),
    box.size.get(target),
  ];

  return typedFromEntries(
    borderDir.map(
      bd =>
        [
          bd,
          size.tupled([
            borderDir.isLeftEdge(bd)
              ? left
              : borderDir.isRightEdge(bd)
              ? right
              : width,

            borderDir.isTopEdge(bd)
              ? top
              : borderDir.isBottomEdge(bd)
              ? bottom
              : height,
          ]),
        ] as [BorderDir, Size],
    ),
  );
};

// apply correct sizes according to target box to each border part
const setPartSizes: BinaryC<Border, Box, Border> = br => target => {
  const sizes: Bordered<Size> = FN.pipe(target, partSizes(br));

  return FN.pipe(
    borderDir.map(
      bd =>
        [bd, FN.pipe(br[bd], FN.pipe(sizes[bd], box.size.set, OP.map))] as [
          BorderDir,
          MaybeBox,
        ],
    ),
    typedFromEntries,
  );
};

/** Add border to box */
export const apply: Unary<Border, Endo<Box>> = br => target => {
  const sized = FN.pipe(target, setPartSizes(br));

  return FN.pipe(
    [
      [sized.topLeft, sized.top, sized.topRight],
      [sized.left, OP.some(target), sized.right],
      [sized.bottomLeft, sized.bottom, sized.bottomRight],
    ],
    AR.map(AR.compact),
    AR.filter(FN.flow(AR.size, isPositive)),
    AR.map(box.catRightOf),
    box.catBelow,
  );
};

export const named: Record<BorderName, Endo<Box>> = FN.pipe(
  borderNames,
  RA.map(toSnd(FN.flow(n => sets[n], apply))),
  typedFromEntries,
);
