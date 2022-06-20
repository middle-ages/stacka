import { array as AR, function as FN, tuple as TU } from 'fp-ts';
import { Border, border, Box, box, color, SetName } from 'src/stacka';
import stringWidth from 'string-width';
import * as HE from '../../helpers';

/** Report on all named border sets */

const gallery = HE.gallery('Named Border Sets');

const borders = Object.entries(border.all) as [SetName, Border][];

const colors = {
  demoFg: 'orange',
  demoBg: 'darker',
  demoNameFg: 'white',
  frameBg: 'darkest',
} as const;

const cellWidth =
  Math.max(...FN.pipe(borders, AR.map(FN.flow(TU.fst, stringWidth)))) + 1;

const demoBox = ([name, br]: [string, Border]): Box =>
  box.centered({
    width: cellWidth,
    row: FN.pipe(name, color(colors.demoNameFg)),
    apply: FN.pipe(br, border.setColor([colors.demoFg, colors.demoBg]), border),
  });

FN.pipe(borders, AR.map(demoBox), gallery, box.print);
