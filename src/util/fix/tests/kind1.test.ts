import { array as AR, tuple as TU } from 'fp-ts';
import { cartesian } from 'fp-ts-std/Array';
import { until } from 'fp-ts-std/Function';
import { increment, pipe, tupled } from 'fp-ts/lib/function';
import { blowsStack } from 'util/chai';
import { Effect, Unary } from 'util/function';
import { Pair, squareMapSnd } from 'util/tuple';
import { assert, suite, test } from 'vitest';
import { deMorgan, falseValue, trueValue, xor } from './expr/eg';
import { and, not, or } from './expr/ops';
import { runAndShow, runExpr, show } from './expr/schemes';
import { Expr } from './expr/types';

const [T, F] = [trueValue, falseValue];

const expectedXor = '((⊤ ∨ ⊤) ∧ ¬(⊤ ∧ ⊤))';

suite('run', () => {
  const [runsTrue, runsFalse]: Pair<Effect<Expr>> = [
    e => assert.isTrue(runExpr(e)),
    e => assert.isFalse(runExpr(e)),
  ];

  suite('basic', () => {
    test('⊥', () => runsFalse(F));
    test('¬⊥', () => runsTrue(not(F)));
    test('⊤∧⊤', () => runsTrue(and(T, T)));
    test('⊥∨⊤', () => runsTrue(or(F, T)));
    test('⊥⊻⊤', () => runsTrue(xor(F, T)));
  });

  suite('∀p,q ⇒ deMorgan(p,q)', () => {
    const allDeMorgans: [Pair<Expr>, Expr][] = pipe(
      [T, F],
      cartesian([T, F]),
      pipe(deMorgan, tupled, squareMapSnd, AR.map),
    );

    allDeMorgans.forEach(([[l, r], e]) =>
      test(`${show(l)}, ${show(r)}`, () => runsTrue(e)),
    );
  });
});

suite('show', () =>
  test(`xor`, () => assert.equal(show(xor(T, T)), expectedXor)),
);

suite('zip algebras', () =>
  test('runAndShow', () =>
    assert.deepEqual(runAndShow(xor(T, T)), [false, expectedXor])),
);

// takes 15sec to complete
suite('stack safety', () => {
  const deepNot: Unary<number, [Expr, number]> = n =>
    pipe(
      [T, 1],
      pipe(
        TU.bimap(increment, not),
        until(([, i]) => i > n),
      ),
    );

  const n = 15_000;

  const expr = TU.fst(deepNot(n));

  test('run is unsafe', () => blowsStack(() => pipe(expr, runExpr)));
});
