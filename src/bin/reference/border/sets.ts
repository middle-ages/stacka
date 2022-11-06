import { array as AR, function as FN, option as OP, tuple as TU } from 'fp-ts';
import {
  Border,
  border,
  BorderName,
  Box,
  box,
  Color,
  color,
  ColorPair,
} from 'src/stacka';
import stringWidth from 'string-width';
import * as HE from '../../helpers';

/** Report on all named border sets */

const borders = Object.entries(border.sets) as [BorderName, Border][];

const demoNameBg: Color = 'darker',
  demoName: ColorPair = ['white', demoNameBg],
  demo: ColorPair = ['lime', 'black'];

const cellWidth =
  Math.max(...FN.pipe(borders, AR.map(FN.flow(TU.fst, stringWidth)))) + 1;

const demoBox = ([name, br]: [string, Border]): Box =>
  box.centered({
    width: cellWidth,
    row: FN.pipe(name, color.of(demoName)),
    apply: FN.pipe(br, border.setColor(demo), border),
    gridBg: demoNameBg,
  });

const gallery = FN.pipe(
  'Named Border Sets',
  HE.colorGallery(1, OP.some(demoNameBg)),
);

FN.pipe(borders, AR.map(demoBox), gallery, box.print);
