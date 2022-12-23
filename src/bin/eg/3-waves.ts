import { array as AR, nonEmptyArray as NEA } from 'fp-ts';
import { add } from 'fp-ts-std/Number';
import { flow, Lazy, pipe } from 'fp-ts/function';
import { border, Box, box, color, Color, termSize } from 'src/stacka';

const phases: number = (() => {
  const final = parseInt(process.argv[2]);
  return Number.isInteger(final) ? final : 1;
})();

/* Stacking charts on top of each other */

const innerBarWidth = 2, // bar width > 0, or ≥0 if has border
  barGap = -1, // gap between bars, negative means shifted into prev bar
  waveCount = 2, // how may waves?
  topMargin = 3,
  hMargin = 1,
  nextColor: Lazy<Color> = color.cycle(['blueviolet', 'orangered']);

const fn = Math.sin;

const [termWidth, termHeight] = termSize(),
  borderWidth = 1,
  termPad = 2 * hMargin + 2 * borderWidth,
  barWidth = barGap + innerBarWidth + 2 * borderWidth,
  barCount = Math.floor((termWidth - termPad - 2) / barWidth),
  domain = NEA.range(0, barCount - 1),
  waves = NEA.range(0, waveCount - 1);

const wave =
  (phase: number) =>
  (waveIdx: number): Box => {
    // inject the X-axis into the domain of `fn`: from `Turns` unit to `Rad`
    const inject =
      (waveIdx: number) =>
      (x: number): number =>
        2 *
        Math.PI *
        (waveIdx / waveCount + (x + phase * (waveIdx % 2 ? -1 : 1)) / barCount);

    // project the Y-axis from the range of `fn`: scale to term height
    const project = (y: number): number =>
      1 + (y + 1) * (1 / 2) * (termHeight - topMargin - 2);

    // build one bar
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

    const color = nextColor();

    return pipe(
      pipe(domain, AR.map(flow(inject(waveIdx), fn, project, Math.round))),
      pipe(color, bar(waveIdx), AR.map),
      box.catRightOfGap(barGap),
      pipe(waveIdx, add, box.left.mod),
      box.combineOver,
    );
  };

const atPhase = (phase: number) =>
  pipe(
    waves,
    pipe(phase, wave, AR.map),
    box.branch,
    box.blend.set('screen'),
    box.subHeight(1),
    border.colored('hMcGugan', [0xff_30_30_30, 0xff_08_08_08]),
    box.marginLeft(hMargin),
    box.print,
  );

for (let phase = 0; phase < phases; phase++) {
  process.stdout.cursorTo(0, topMargin - 2);
  atPhase(phase);
}
