import { flow, pipe } from 'fp-ts/lib/function';
import { AlgebraOf } from 'util/fix/kind1';
import { Lazy } from 'util/function';
import { delay, final, tco, Tco } from 'util/tco';
import { bind, done, matchTrampoline, Trampoline, URI } from './types';

type _run = <A, B>(t: Trampoline<A, B>) => Tco<A>;

const _run: _run = <A, B>(t: Trampoline<A, B>) =>
  pipe(
    t,
    matchTrampoline<Tco<A>, A, B>(
      final,

      (lta: Lazy<Trampoline<A>>) => {
        const ta = lta();
        return delay(() => _run(ta));
      },

      k =>
        matchTrampoline<Tco<A>, B, A>(
          flow(k, res => delay(() => _run(res))),

          (lta: Lazy<Trampoline<B>>) =>
            delay(() => _run(bind(lta(), res => bind(done(res), k)))),

          innerK => innerSub =>
            _run(bind(innerSub, inner => bind(innerK(inner), k))),
        ),
    ),
  );

/* Safely run recursive computations in the trampoline monad */
export const run: AlgebraOf<URI> = flow(_run, tco);
