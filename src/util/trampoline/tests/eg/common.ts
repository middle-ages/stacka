import { nonEmptyArray as NE, state as ST } from 'fp-ts';
import { constant, flow, pipe } from 'fp-ts/lib/function';
import { Unary } from 'util/function';

export type Bucket = number;
export const emptyBucket: Bucket = 0;

export type State<T> = ST.State<Bucket, T>;

export const consumeState: State<number> = bucket => [bucket, bucket - 1];

/**  make an initial bucket with N unconsumed, and N state transitions */
export const makeN: Unary<number, [Bucket, State<number>[]]> = n => [
  n,
  flow(NE.range, pipe(consumeState, constant, NE.map))(1, n),
];
