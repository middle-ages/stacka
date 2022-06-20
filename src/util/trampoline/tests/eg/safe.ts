import {
  array as AR,
  readonlyArray as RA,
  state as ST,
  tuple as TU,
} from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import { flow, pipe } from 'fp-ts/lib/function';
import { head } from 'util/array';
import { BinaryC, Unary } from 'util/function';
import { run } from 'util/trampoline/run';
import { bind, cont, done, Trampoline } from 'util/trampoline/types';
import { Bucket, makeN, State } from './common';

export type RecState<A> = Trampoline<State<A>>;

const prepend: BinaryC<State<number>, number[], State<number[]>> = st => ns =>
  pipe(st, ST.map(flip(AR.prepend)(ns)));

export const _safeSequence: Unary<
  State<number>[],
  RecState<number[]>
> = states =>
  !states.length
    ? done(ST.of([]))
    : states.length === 1
    ? pipe(states, head, ST.map(AR.of), done)
    : bind(
        cont(() => _safeSequence(states.slice(1, states.length))),
        flow(ST.chain(prepend(states[0])), done),
      );

export const safeSequence: Unary<State<number>[], State<number[]>> = flow(
  _safeSequence,
  run,
);

/**
 * A recursive but stack-safe version of `ST.sequenceArray`, used to test the
 * trampoline monad.
 */
export const computeSafe: Unary<number, [number, Bucket]> = n => {
  const [st0, nTransitions] = makeN(n);
  const sequenced: State<number[]> = safeSequence(nTransitions);
  return pipe(st0, sequenced, TU.mapFst(RA.size));
};
