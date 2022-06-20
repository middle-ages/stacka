import { function as FN, monoid as MO, option as OP } from 'fp-ts';
import { Pair } from 'util/tuple';
import { Unary } from 'util/function';
import { Matrix } from '../data';
import * as switches from './switches';
import { registry as reg } from '../registry';
import * as IN from './instances';

/**
 * Given a set of `Bitmap⇒Bitmap` functions, and a pair of bitmaps, for each
 * function, run it on the bitmap and return a character if found.  If no
 * characters found for any of the functions, returns `None`.
 */
export const tryStacks: Unary<Pair<Matrix>, OP.Option<string>> = bms => {
  const stacked = FN.pipe(bms, MO.concatAll(IN.monoid));

  for (const pixelSwitch of switches.centered) {
    const res = FN.pipe(stacked, pixelSwitch, reg.charByMatrix);

    if (OP.isSome(res)) return res;
  }
  return OP.none;
};
