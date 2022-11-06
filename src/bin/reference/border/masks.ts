import { array as AR, function as FN, record as RC } from 'fp-ts';
import { Border, border, Box, box, color, Mask, BorderName } from 'src/stacka';
import stringWidth from 'string-width';
import * as HE from '../../helpers';

/**
 * Show various way of masking parts of a border
 *
 * With no arguments, the target of operation will be the thick line border.
 *
 * If given a named border set it will be used as the demo target border.
 *
 * `-h` will show the named border list.
 *
 * Examples:
 *
 * ```txt
 * border/masks.ts -h
 * border/masks.ts dash.thick.wide
 */

const arg = process.argv[2];

if (arg === '-h') {
  Object.keys(border.names).forEach(n => console.log(n));
  process.exit();
}

if (undefined !== arg && !border.isBorderName(arg)) {
  console.error(`Unknown border set named: “${arg}”, run with “-h”`);
  process.exit();
}

const targetName = (arg ?? 'thick') as BorderName,
  target = FN.pipe(
    border.sets[targetName],
    border.setColor(['lime', 'darkest']),
  );

const widest = Math.max(...RC.keys(border.mask).map(stringWidth));

type MaskMargins = Partial<Record<Mask, number>>;

const [addRows, addCols]: [MaskMargins, MaskMargins] = [
  { openT: 1, openB: 1, noHEdges: 2 },
  { openL: 1, openR: 1, noVEdges: 2 },
];

const demo = (name: Mask, op: (br: Border) => Border): Box => {
  const rows = FN.pipe(
    name === 'openT' ? ['', name] : [name],
    AR.map(color.of(['white', 'dark'])),
  );
  return FN.pipe(
    {
      rows,
      width: widest + (addCols[name] ?? 0),
      height: 1 + (addRows[name] ?? 0),
      gridBg: 'darker',
    },
    box.centered,
    FN.pipe(target, op, border),
    border.withFg('dotted', 'dark'),
  );
};

FN.pipe(
  FN.pipe(border.mask, RC.mapWithIndex(demo), Object.values),
  HE.snugGallery(`Built-in Border Masks on “${targetName}” Border Set`),
  box.print,
);
