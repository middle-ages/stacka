import { pipe } from 'fp-ts/lib/function';
import { border, box } from 'src/stacka';
import { magenta } from 'ansis/colors';

pipe(
  [magenta.bold`Hello🌍World`, 'from stacka'],
  box.fromRows,
  box.alignR,
  box.hMargins(1),
  pipe(border.sets.round, border.setFg('orange'), border.add),
  box.print,
);
