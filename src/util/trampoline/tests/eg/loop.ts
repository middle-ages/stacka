import { state as ST, tuple as TU } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { size } from 'fp-ts/lib/ReadonlyArray';
import { Unary } from 'util/function';
import { Bucket, makeN } from './common';

/* Will NOT blow up stack because fp-ts traverses on state uses a loop */
export const computeLoop: Unary<number, [number, Bucket]> = n => {
  const [st0, nTransitions] = makeN(n);
  return pipe(st0, ST.sequenceArray(nTransitions), TU.mapFst(size));
};
