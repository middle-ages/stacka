import { array as AR, function as FN } from 'fp-ts';
import { join } from 'fp-ts-std/Array';
import { split } from 'fp-ts/lib/string';
import { bitmap, Color, border, Box, box, color } from 'src/stacka';

const rawArgs = process.argv.slice(3).join('');

const args = (
  rawArgs === '' ? 'H:14,E:8,L:4,L:2,O:1, :0,W:0,O:1,R:2,L:4,D:8,!:14' : rawArgs
)
  .split(',')
  .map(split(':'))
  .map(
    // spaces are gobbled up by node.js argument splitting
    // if we see empty label, it is space
    ([fst, snd]) => [fst === '' ? ' ' : fst, snd] as const,
  ) as [string, string][];

const colors = {
  panelBg: 'light',
  valueBg: 'lighter',
  frameBg: 'darkest',
  sepFg: 'black',
  args: ['grey', 'darkGrey'],
  frame: ['darker', 'dark'],
  innerSepFg: 'blue',
  argKey: color.hex('#447f0088'),
  argValue: color.hex('#7f004488'),
} as const;

const addBorder = (colors: readonly [Color, Color]) =>
  border.colored('halfSolidNear', [...colors]);

const nextColor = color.rainbow8Gen();

const sep = FN.pipe(
    bitmap.line.vertical,
    color.of([colors.sepFg, colors.panelBg]),
  ),
  innerSep = FN.pipe(':', color.of([colors.innerSepFg, colors.panelBg]));

const argBox = box({
  apply: addBorder(colors.args),
  rows: FN.pipe(
    args,
    AR.map(showArg),
    AR.chunksOf(6),
    FN.pipe(sep, join, AR.map),
  ),
});

FN.pipe(
  args,
  AR.mapWithIndex(bar),
  box.catSnugRightOf,
  box.blend.set('screen'),
  box.setGridBg(colors.frameBg),
  addBorder(colors.frame),
  box.belowCenter(argBox),
  box.margin(2),
  box.print,
);

function bar(idx: number, [name, rawHeight]: [string, string]): Box {
  const height = Number.parseInt(rawHeight);

  if (Number.isNaN(height) || height < 0)
    throw new Error(`Cannot parse as Int⁺: “${height}” for “${name}”`);

  return box({
    row: FN.pipe(name, color.bg(colors.sepFg)),
    height: height + 1, // 1 character for the bar label
    apply: border.withFg(idx % 2 ? 'hThick' : 'vThick', nextColor()),
  });
}

function showArg([name, height]: [string, string]): string {
  return FN.pipe(
    [
      FN.pipe(
        name.replace(/^ $/, '␣'),
        color.of([colors.argKey, colors.valueBg]),
      ),
      FN.pipe(height.padStart(2), color.of([colors.argValue, colors.valueBg])),
    ],
    join(innerSep),
  );
}
