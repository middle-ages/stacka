import * as laws from 'fp-ts-laws';
import { color } from 'src/color';
import { testProp } from 'util/test';
import { assert, suite, test } from 'vitest';

suite('color instances', () => {
  test('show', () =>
    assert.equal(color.show.show('red'), 'R:255 G:0 B:0 A:1.00'));

  suite('eq', () => {
    testProp('color eq', [color.arb], c => color.eq.equals(c, c));
  });

  suite('laws', () => {
    test('eq', () => laws.eq(color.eq, color.arb));

    test('over monoid', () =>
      laws.monoid(color.monoid, color.maybeEq, color.maybeArb));

    test('under monoid', () =>
      laws.monoid(color.underMonoid, color.maybeEq, color.maybeArb));
  });
});
