import { array as AR, function as FN, option as OP, record as RC } from 'fp-ts';
import { applyEvery, fork } from 'fp-ts-std/Function';
import { mapBoth, withSnd } from 'fp-ts-std/Tuple';
import { backdrop } from 'src/backdrop';
import { bitmap } from 'src/bitmap';
import { Box, box, BoxSet } from 'src/box';
import { Color, color } from 'src/color';
import { dir, Orient, corner } from 'src/geometry';
import { typedFromEntries } from 'util/object';
import { apply1, BinaryC, Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { grid } from '../grid';
import { apply } from './apply';
import { mask } from './mask';
import { sets } from './sets';
import { Border } from './types';

export const [hLines, vLines]: Pair<Border> = FN.pipe(
  sets.line,
  fork([mask.noVEdges, mask.noHEdges]),
);

export const big: Endo<Box> = FN.flow(
  apply(sets.halfSolidFar),
  apply(sets.halfSolidNear),
);

/** Nest a border list with the 1st as the innermost */
export const nest: BoxSet<Border[]> = FN.flow(AR.map(apply), applyEvery);

const fromBackdropChar = FN.flow(
  grid.cell.parseRow,
  AR.of,
  box.fromBackdropImage,
);

const [thin, thick]: Pair<Orient> = [
  bitmap.line.dash.wide,
  bitmap.line.dash.thick.wide,
];

export const topHSep: Border = FN.pipe(sets.line, mask.noVEdges, mask.openB),
  thickTopHSep: Border = FN.pipe(sets.thick, mask.noVEdges, mask.openB);

export const hRuleOf: BinaryC<string, number, Box> = char => width =>
  FN.pipe(char, fromBackdropChar, box.height.set(1), box.width.set(width));

export const [hRule, hRuleThick] = FN.pipe(
  [thin.horizontal, thick.horizontal],
  mapBoth(hRuleOf),
);

/** Adds the given padding to all directions of a box */
export const pad: Unary<number, Endo<Box>> = n =>
  nest(AR.replicate(n, sets.space));

export const checkeredNear: Unary<Color, Border> = bg => {
  const checker: Unary<string, Pair<string>> = s =>
    FN.pipe(
      [...(['black', 'lightGrey'] as const)],
      mapBoth(FN.flow(withSnd(bg), color.of, apply1(s)<Endo<string>>)),
    );

  const { top, bottom, left, right } = FN.pipe(
    bitmap.line,
    dir.pickDirs<string>(),
    RC.map(checker),
  );

  return {
    ...FN.pipe(
      corner.map(withSnd(OP.some(box.fromRow(FN.pipe(' ', color.bg(bg)))))),
      typedFromEntries,
    ),
    ...FN.pipe(
      {
        left: right,
        right: left,
        top: [bottom.join('')],
        bottom: [top.join('')],
      },
      RC.map(
        FN.flow(grid.parseRows, backdrop.repeat, box.fromBackdrop, OP.some),
      ),
    ),
  };
};
