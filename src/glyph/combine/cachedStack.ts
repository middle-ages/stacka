import { option as OP, function as FN } from 'fp-ts';
import { Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { mapBoth } from 'fp-ts-std/Tuple';
import { Matrix, bitmap } from 'src/bitmap';
import * as SK from '../../bitmap/ops/stack';
import { join } from 'fp-ts-std/Array';

const stackCache = new Map<string, OP.Option<string>>();

const makeKey: Unary<Pair<Matrix>, string> = FN.flow(
  mapBoth(bitmap.toBin),
  join(''),
);

export const tryStacks: Unary<Pair<Matrix>, OP.Option<string>> = bms => {
  const maybeOrUndefChar = stackCache.get(makeKey(bms));
  if (maybeOrUndefChar !== undefined) return maybeOrUndefChar;

  const res: OP.Option<string> = SK.tryStacks(bms);
  stackCache.set(makeKey(bms), res);

  return res;
};
