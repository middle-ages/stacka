import { array as AR, function as FN } from 'fp-ts';
import { join } from 'fp-ts-std/Array';
import { split } from 'fp-ts/lib/string';
import {
  addHeight,
  dumpRender,
  hCat,
  lineBox,
  render,
  fromRowsT,
  setHPadding,
  setPlusFill,
  box,
} from 'src/box';

import { colorizeBg, colorizeFg, fgColor, rainbowGen } from 'util/color';
import { hex } from 'util/hex';
import { Pair, pairMap } from 'util/tuple';

const hello = 'hello';

//const canvas = l;
