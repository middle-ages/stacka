import { hex, magenta, cyan } from 'ansis/colors';
import { pipe } from 'fp-ts/lib/function';
import { border, box } from 'src/stacka';

pipe(
  [
    hex('#bbb').italic`one boxed in`,
    magenta.bold`Hello 🌍 World`,
    hex('#888')('ANSI bold and'),
    cyan`brave` + ' ' + magenta.underline`magenta`,
    '+ one emoji',
  ],
  box.fromRows,
  box.center,
  box.hMargins(1),
  border.withFg('round', 'magenta'),
  box.print,
);
