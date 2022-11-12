import { array as AR, function as FN, tuple as TU } from 'fp-ts';
import { Border, border, box, Color, color } from 'src/stacka';

/**
 * Borders are implemented as boxes showing the border character at each
 * direction. Boxes nest, so border nest as well.
 */

const [sets, grays] = [border.sets, color.grays];

const borders: [Color, Border][] = [
  [grays[87], sets.halfSolidNear],
  [grays[80], sets.halfSolidFar],
  [grays[74], sets.halfSolidNear],
  [grays[67], sets.space],
  [grays[55], sets.halfSolidNear],
  [grays[45], sets.space],
  [grays[30], sets.near],
  [grays[20], sets.line],
  [grays[10], sets.space],
  [grays[6], sets.dotted],
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
  color.fg('darkblue'),
  box.of,
  box.colorBg('white'),
  border.colored('near', [grays[97], grays[92]]),
  border.nest(colored),
  box.print,
);
