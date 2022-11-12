import ansis, { Ansis } from 'ansis';
import { function as FN } from 'fp-ts';
import * as color from 'src/color';
import { Endo, Unary } from 'util/function';
import { Tuple3 } from 'util/tuple';
import * as DE from './deco';
import { bgLens, deco, fgLens } from './lens';
import { Style } from './types';

export const [clearFg, clearBg, clearDeco]: Tuple3<Endo<Style>> = [
    fgLens.color.set(0),
    bgLens.color.set(0),
    deco.set(0),
  ],
  clearColor: Endo<Style> = FN.flow(clearFg, clearBg),
  flip: Endo<Style> = s => {
    const [fg, bg] = [fgLens.color.get(s), bgLens.color.get(s)];
    return FN.pipe(s, fgLens.color.set(bg), bgLens.color.set(fg));
  };

export const ops = {
  fg: color.delegateOps(fgLens.color),
  bg: color.delegateOps(bgLens.color),
};

export const addToAnsis: Unary<Style, Endo<Ansis>> = ([fg, bg, deco]) =>
  FN.flow(color.addToAnsis([fg, bg]), DE.addToAnsis(deco));

export const paint: Unary<Style, Endo<string>> = style =>
  FN.pipe(ansis, addToAnsis(style));
