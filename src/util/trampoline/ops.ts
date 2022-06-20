import { identity } from 'fp-ts/lib/function';
import { Kind, URIS } from 'fp-ts/lib/HKT';
import { Traversable1 } from 'fp-ts/lib/Traversable';
import { chain, trampolineApplicative } from './instances';
import { Trampoline } from './types';

export type flatten = <A>(t: Trampoline<Trampoline<A>>) => Trampoline<A>;

export const flatten: flatten = chain(identity);

export const sequenceTraversable =
  <F extends URIS>(tr: Traversable1<F>) =>
  <A>(fta: Kind<F, Trampoline<A>>): Trampoline<Kind<F, A>> =>
    tr.sequence(trampolineApplicative)(fta);
