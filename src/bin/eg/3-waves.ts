import { array as AR, nonEmptyArray as NE } from 'fp-ts';
import { add } from 'fp-ts-std/Number';
import { flow, Lazy, pipe } from 'fp-ts/function';
import { border, Box, box, color, Color, termSize } from 'src/stacka';

const phase: number = (() => {
  const p = parseInt(process.argv[2]);
  return Number.isNaN(p) ? 0 : p;
})();

/* Stacking three charts on top of each other */

const innerBarWidth = 3, // bar width > 0, or ≥0 if has border
  barGap = -1, // gap between bars, negative means shifted into prev bar
  waveCount = 3, // how may waves?
  margin = 2,
  nextColor: Lazy<Color> = color.cycle([
    color.hex('#05af'),
    color.hex('#4742'),
    color.hex('#f80a'),
  ]),
  blend = box.blendScreen;

const fn = Math.sin;

const [termWidth, termHeight] = termSize(),
  borderWidth = 2,
  barWidth = barGap + innerBarWidth + borderWidth,
  barCount = Math.floor((termWidth - 2 * margin - waveCount) / barWidth),
  domain = NE.range(0, barCount - 1),
  waves = NE.range(0, waveCount - 1);

// inject the X-axis into the domain of `fn`: from `Turns` unit to `Rad`
const inject =
    (waveIdx: number) =>
    (x: number): number =>
      2 *
      Math.PI *
      (waveIdx / waveCount + (x + phase * (waveIdx % 2 ? -1 : 1)) / barCount),
  // project the Y-axis from the range of `fn`: scale to term height
  project = (y: number): number =>
    1 + (y + 1) * (1 / 2) * (termHeight - 2 * margin - 6);

const bar =
  (waveIdx: number) =>
  (color: Color) =>
  (height: number): Box =>
    pipe(
      box.empty,
      box.size.set({ width: innerBarWidth, height }),
      pipe(
        border.sets[waveIdx === waveCount - 1 ? 'thick' : 'line'],
        border.mask.openB,
        border.setFg(color),
        border,
      ),
    );

const wave = (waveIdx: number): Box => {
  const color = nextColor();
  return pipe(
    pipe(domain, AR.map(flow(inject(waveIdx), fn, project, Math.round))),
    pipe(color, bar(waveIdx), AR.map),
    box.catRightOfGap(barGap),
    pipe(waveIdx, add, box.left.mod),
    blend,
  );
};

pipe(
  waves,
  AR.map(wave),
  box.branch,
  blend,
  box.alignT,
  box.subHeight(1),
  border.withFg('hMcGugan', 'dark'),
  box.margin(margin),
  box.print,
);
