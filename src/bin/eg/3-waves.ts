import { array as AR, function as FN, nonEmptyArray as NE } from 'fp-ts';
import { add, multiply } from 'fp-ts-std/Number';
import { border, Box, box, color, Color, termSize } from 'src/stacka';
import { toCyclicGen } from 'util/array';

/* Stacking three charts on top of each other */

const innerBarWidth = 4, // bar width > 0, or ≥0 if has border
  barGap = -1, // gap between bars, negative means shifted into prev bar
  waveCount = 3, // how may waves?
  waveShift = 1, // each wave is shifted right waveShift × waveIdx
  nextColor: FN.Lazy<Color> = toCyclicGen([
    color.hex('#ff0000c8'),
    color.hex('#0000ffa8'),
    color.hex('#00ff0088'),
  ]),
  blend = box.blend.set('screen');

const fn = Math.sin;

const [width, height] = termSize(),
  borderWidth = 2,
  barWidth = barGap + innerBarWidth + borderWidth,
  barCount = Math.floor((width - waveCount) / barWidth),
  domain = NE.range(0, barCount - 1),
  waves = NE.range(0, waveCount - 1);

const inject =
    (shift: number) =>
    (x: number): number =>
      2 * Math.PI * (shift + x / barCount),
  project = (y: number): number => 1 + (y + 1) * (1 / 2) * (height - 6);

const addBorder = (color: Color): ((box: Box) => Box) =>
  FN.pipe('double', border.withFg(color), border);

const bar =
  (color: Color) =>
  (height: number): Box =>
    FN.pipe(
      box.empty,
      box.size.set({ width: innerBarWidth, height }),
      addBorder(color),
    );

const wave = (waveIdx: number): Box => {
  const color = nextColor();
  return FN.pipe(
    FN.pipe(
      domain,
      AR.map(FN.flow(inject(waveIdx / waveCount), fn, project, Math.round)),
    ),
    FN.pipe(color, bar, AR.map),
    box.catRightOfGap(barGap),
    FN.pipe(waveIdx, multiply(waveShift), add, box.left.mod),
    blend,
  );
};

FN.pipe(waves, AR.map(wave), box.branch, blend, box.print);
