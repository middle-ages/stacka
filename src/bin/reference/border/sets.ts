import { array as AR, function as FN, tuple as TU } from 'fp-ts';
import { Border, border, BorderName, Box, box, Color, color } from 'src/stacka';
import stringWidth from 'string-width';
import * as HE from '../../helpers';

/** Report on all named border sets */

const borders = Object.entries(border.sets) as [BorderName, Border][];

const demo: [Color, Color] = ['lime', 'black'];

const cellWidth =
  Math.max(...FN.pipe(borders, AR.map(FN.flow(TU.fst, stringWidth)))) + 1;

const demoBox = ([name, br]: [string, Border]): Box =>
  box.centered({
    width: cellWidth,
    row: FN.pipe(name, color.fg(HE.lighten('lime'))),
    apply: FN.pipe(br, border.setColor(demo), border),
    gridBg: HE.grays[10],
  });

const gallery = HE.colorGallery([1, 1])('Named Border Sets');

FN.pipe(borders, AR.map(demoBox), gallery, box.print);
