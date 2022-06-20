import {
  array as AR,
  function as FN,
  nonEmptyArray as NEA,
  random as RN,
} from 'fp-ts';
import * as io from 'fp-ts/lib/IO';
import { IO } from 'fp-ts/lib/IO';
import { border, Box, box, boxes, FlowConfig, termWidth } from 'src/stacka';

/** Shows how to use `boxes.flow` and how to mark clipped boxes */

const flowConfig: Partial<FlowConfig> = {
  placeH: box.catSnugRightOfTop,
  placeV: box.catSnugBelow,
  hGap: -1,
  clipMark: box.setSolidBg('red'),
};

const rndCount = RN.randomInt(1, 20),
  rndChildWidth = RN.randomInt(4, 16),
  rndParentWidth = RN.randomInt(3, Math.floor(termWidth() / 3)),
  rndWidths = (count: number): IO<readonly number[]> =>
    FN.pipe(AR.replicate(count, rndChildWidth), io.sequenceArray);

const node = (width: number): Box =>
  FN.pipe(
    NEA.range(1, width)
      .map(s => s.toString())
      .join(''),
    box.fromRow,
    border.line,
  );

const outerBorder = FN.pipe(border.sets.thick, border.setFg('dark'), border);

const flowBox: IO<Box> = FN.pipe(
  rndCount,
  io.chain(rndWidths),
  io.map(widths => FN.pipe([...widths], AR.map(node))),
  io.chain(bxs =>
    FN.pipe(
      rndParentWidth,
      io.map(available =>
        FN.pipe(bxs, boxes.flow.of({ ...flowConfig, available }), outerBorder),
      ),
    ),
  ),
);

FN.pipe(
  NEA.range(1, 12),
  NEA.map(flowBox),
  boxes.win.flow.of(flowConfig),
  box.print,
);
