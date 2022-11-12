import { function as FN, option as OP } from 'fp-ts';
import { bitmap } from 'src/bitmap';
import { Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { tryStacks } from './cachedStack';

export const tryCombine: Unary<Pair<string>, OP.Option<string>> = pair =>
  bitmap.hasCharPair(pair)
    ? FN.pipe(pair, bitmap.pairCharToMatrix, tryStacks)
    : OP.none;

export const combine = ([below, above]: Pair<string>) =>
  below === ' ' || below === ''
    ? above
    : above === ' ' || above === ''
    ? below
    : FN.pipe(
        FN.pipe([below, above], tryCombine),
        FN.pipe(above, FN.constant, OP.getOrElse),
      );
