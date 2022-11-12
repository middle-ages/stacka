import { function as FN } from 'fp-ts';
import * as color from 'src/color';
import { Endo } from 'util/function';
import { Tuple3 } from 'util/tuple';
import * as ST from 'src/style';
import { bgColor, deco, fgColor, style } from './lens';
import { Cell } from './types';

export const [clearFg, clearBg, clearDeco]: Tuple3<Endo<Cell>> = [
    fgColor.set(0),
    bgColor.set(0),
    deco.set(0),
  ],
  clearColor: Endo<Cell> = FN.flow(clearFg, clearBg),
  flip: Endo<Cell> = style.mod(ST.flip);

export const [fgOps, bgOps] = [
  color.delegateOps(fgColor),
  color.delegateOps(bgColor),
];
