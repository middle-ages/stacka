import {
  array as AR,
  readonlyArray as RA,
  state as ST,
  tuple as TU,
} from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { head, headTail } from 'util/array';
import { Unary } from 'util/function';
import { Bucket, makeN, State } from './common';

/**
 * A recursive and unsafe version of `ST.sequenceArray`, used to test the
 * trampoline monad.
 *
 * Mutually recursive with `step` and not immediately obvious how to enable
 * tail-call optimization on this code.
 */
export const unsafeSequence: Unary<State<number>[], State<number[]>> = states =>
  !states.length
    ? ST.of<Bucket, number[]>([])
    : states.length === 1
    ? pipe(states, head, ST.map(AR.of))
    : pipe(states, headTail, step);

const step = ([head, tail]: [State<number>, State<number>[]]): State<
  number[]
> =>
  pipe(
    head,
    ST.chain(fst => pipe(tail, unsafeSequence, ST.map(AR.prepend(fst)))),
  );

export const computeUnsafe: Unary<number, [number, Bucket]> = n => {
  const [st0, nTransitions] = makeN(n);
  return pipe(st0, unsafeSequence(nTransitions), TU.mapFst(RA.size));
};
