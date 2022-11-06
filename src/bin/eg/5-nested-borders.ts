import { array as AR, function as FN, tuple as TU } from 'fp-ts';
import { Border, border, box, Color, color } from 'src/stacka';

/**
 * Borders are implemented as boxes showing the border character at each
 * direction. Boxes nest, so border nest as well.
 */

const sets = border.sets;

const borders: [Color, Border][] = [
  ['white', sets.near],
  ['white', sets.halfSolidNear],
  ['lightGrey', sets.halfSolidFar],
  ['lightGrey', sets.halfSolidNear],
  ['grey', sets.space],
  ['darkGrey', sets.halfSolidNear],
  ['darkerGrey', sets.space],
  ['darkestGrey', sets.near],
  ['dark', sets.line],
  ['darker', sets.space],
  ['darkest', sets.dotted],
];

// a list of borders to be nested
const colored: Border[] = FN.pipe(
  borders,
  AR.mapWithIndex((idx, [clr, br]) =>
    FN.pipe(
      br,
      FN.pipe(
        [clr, 'black'] as [Color, Color],
        idx ? FN.identity : TU.swap,
        border.setColor,
      ),
    ),
  ),
);

FN.pipe(
  'borders nest',
  color.of(['darkBlue', 'white']),
  box.of,
  box.margin(1),
  box.setSolidBg('white'),
  border.nest(colored),
  box.print,
);
