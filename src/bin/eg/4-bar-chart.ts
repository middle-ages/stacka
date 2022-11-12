import { array as AR, function as FN } from 'fp-ts';
import { join } from 'fp-ts-std/Array';
import { split } from 'fp-ts/lib/string';
import { bitmap, border, Box, box, color } from 'src/stacka';

const rawArgs = process.argv.slice(3).join('');

const args = (
  rawArgs === '' ? 'H:14,E:8,L:4,L:2,O:1, :0,W:0,O:1,R:2,L:4,D:8,!:14' : rawArgs
)
  .split(',')
  .map(split(':'))
  .map(([fst, snd]) => [fst === '' ? ' ' : fst, snd] as const) as [
  string,
  string,
][];

const colors = {
  panelBg: color.grays[94],
  sepFg: color.grays[15],
  frame: [color.grays[15], color.grays[4]],
  innerSepFg: 'blue',
  argKey: 'darkgreen',
  argValue: 'darkred',
} as const;

const addBorder = border.colored('halfSolidNear', [...colors.frame]);

const nextColor = color.rainbow6Gen();

const sep = FN.pipe(
    bitmap.line.vertical,
    color.of([colors.sepFg, colors.panelBg]),
  ),
  innerSep = FN.pipe(':', color.fg(colors.innerSepFg));

const argBox = box({
  apply: FN.flow(box.colorBg(colors.panelBg), addBorder),
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
  box.blendScreen,
  addBorder,
  box.belowCenter(argBox),
  box.margin(2),
  box.print,
);

function bar(idx: number, [name, rawHeight]: [string, string]): Box {
  const height = Number.parseInt(rawHeight);

  if (Number.isNaN(height) || height < 0)
    throw new Error(`Cannot parse as Int⁺: “${height}” for “${name}”`);

  return box({
    row: name,
    height: height + 1, // 1 character for the bar label
    apply: FN.flow(
      border.withFg(
        idx % 2 ? 'hThick' : 'vThick',
        color.semiOpaque(nextColor()),
      ),
    ),
  });
}

function showArg([name, height]: [string, string]): string {
  return FN.pipe(
    [
      FN.pipe(name.replace(/^ $/, '␣'), color.fg(colors.argKey)),
      FN.pipe(height.padStart(2), color.fg(colors.argValue)),
    ],
    join(innerSep),
  );
}
