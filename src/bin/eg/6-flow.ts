import { nonEmptyArray as NEA } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import { block, border, Box, box, boxes, color } from 'src/stacka';

/**
 * Demo of `boxes.flow` and marking clipped boxes
 *
 * 10 boxes are drawn, each wider than the previous, starting at `width=5` and
 * ending at `width=32`, with jumps of `3` between widths. These are the
 * _parents_.
 *
 * Inside each parent 10 child boxes are drawn. Again each is wider than the
 * previous, ranging from 1 to 10.
 *
 * The parents are _flow_ boxes, so child boxes will flow if they don't fit.
 *
 * Sometimes the child box cannot fit the parent _at all_, even if we start a
 * new row. We use to the `clipMark` field of the `FlowConfig` to highlight
 * these boxes.
 */

const nDigits = (n: number): string =>
  pipe(
    NEA.range(0, n)
      .map(s => s.toString())
      .join(''),
    color.fg(0xff_a0_90_60),
  );

const child: (idx: number) => Box = flow(nDigits, box.fromRow, border.hMcGugan);

const parent = (width: number): Box =>
  pipe(
    NEA.range(0, 9),
    NEA.map(child),
    boxes.flow.of({
      placeH: box.catRightOfTop,
      placeV: box.catBelow,
      clipMark: pipe('darkred', block.setGridFg, box.mapBlock),
      available: 3 * width + 2,
    }),
    border.withFg('line', 'darkgray'),
  );

pipe(
  NEA.range(1, 10),
  NEA.map(parent),
  boxes.win.flow.of({
    placeH: box.catSnugRightOfTop,
    placeV: box.catSnugBelow,
    hGap: -1,
  }),
  box.print,
);
