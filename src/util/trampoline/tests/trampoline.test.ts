import { array as AR, monoid as MO, number as NU } from 'fp-ts';
import { flow, increment, pipe } from 'fp-ts/lib/function';
import { blowsStack } from 'util/chai';
import { Endo, Unary } from 'util/function/types';
import {
  chain,
  map,
  reduce,
  sequence,
  trampolineMonoid,
} from 'util/trampoline/instances';
import { run } from 'util/trampoline/run';
import { bind, cont, done, Trampoline } from 'util/trampoline/types';
import { assert, suite, test } from 'vitest';
import { emptyBucket } from './eg/common';
import { computeLoop } from './eg/loop';
import { computeSafe } from './eg/safe';
import { computeUnsafe } from './eg/unsafe';

const bigintLength: Unary<bigint, number> = n => n.toString().length;

suite('trampoline monad', () => {
  suite('basic', () => {
    const egDone: Trampoline<number> = done(42),
      egCont: Trampoline<number> = cont(() => egDone),
      egBind: Trampoline<number, number> = bind(egCont, flow(increment, done));
    const egShallow: Trampoline<number, number> = bind(
      egBind,
      flow(increment, done),
    );

    test('run done', () => assert.equal(run(egDone), 42));
    test('run cont', () => assert.equal(run(egCont), 42));
    test('run bind', () => assert.equal(run(egBind), 42 + 1));
    test('run shallow', () => assert.equal(run(egShallow), 42 + 1 + 1));

    suite('instances', () => {
      test('monoid', () => {
        const numConcat = pipe(NU.MonoidSum, trampolineMonoid, MO.concatAll),
          actual = pipe([done(1), cont(() => done(2))], numConcat, run);

        assert.equal(actual, 3);
      });

      test('foldable', () => {
        const actual = reduce(done('abc'), 1, (b, a) => a.length + b);
        assert.equal(actual, 4);
      });

      test('traversable', () => {
        const actual: number[] = pipe(
          [1, 2, 3],
          done,
          sequence(AR.Applicative),
          AR.map(run),
        );
        assert.deepEqual(actual, [1, 2, 3]);
      });
    });
  });

  suite('stack-safe factorial using Trampoline<A>', () => {
    const _seededFactorial = (n: bigint, seed: bigint): Trampoline<bigint> =>
      n === 1n ? done(seed) : cont(() => _seededFactorial(n - 1n, seed * n));

    const _factorial: Unary<bigint, Trampoline<bigint>> = n =>
      _seededFactorial(n, 1n);

    const factorial: Endo<bigint> = flow(_factorial, run);

    test('basic', () => assert.equal(factorial(4n), 24n));
    test('10K', () => assert.isTrue(factorial(10n ** 3n) > 10n ** 2_500n));
    test('trampoline map', () =>
      assert.equal(run(map(bigintLength)(_factorial(10n ** 3n))), 2_568));
  });

  suite('trampoline chain', () => {
    test('basic', () =>
      assert.equal(pipe(42, done, chain(flow(increment, done)), run), 43));
  });

  suite.skip('State.sequenceArray', () => {
    suite('built-in fp-ts State.sequenceArray is stack-safe', () => {
      test('basic', () => assert.deepEqual(computeLoop(3), [3, emptyBucket]));

      test('10⁴ iterations', () =>
        assert.deepEqual(computeLoop(10_000), [10_000, emptyBucket]));
    });

    suite('unsafe recursive state arraySequence is NOT stack-safe', () => {
      test('basic', () => assert.deepEqual(computeUnsafe(3), [3, emptyBucket]));

      test('2ˣ10⁴ iterations', () =>
        blowsStack(() => computeUnsafe(2 * 10 ** 4)));
    });
    suite('safe recursive state arraySequence is stack-safe', () => {
      test('3ˣ10⁴ iterations', () =>
        assert.deepEqual(computeSafe(3 * 10 ** 4), [3 * 10 ** 4, emptyBucket]));
    });
  });
});
