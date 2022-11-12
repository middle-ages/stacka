import * as laws from 'fp-ts-laws';
import { assert, suite, test } from 'vitest';
import * as color from '../color';
import { colorBinArb, rgbaColorArb } from './helpers';

suite('color instances', () => {
  test('show', () =>
    assert.equal(
      color.show.show(color.fromName('red')),
      'R:255 G:0 B:0 A:1.00',
    ));

  suite('laws', () => {
    test('eq', () => laws.eq(color.eq, rgbaColorArb));

    test('over monoid', () =>
      laws.monoid(color.overMonoid, color.eq, colorBinArb));

    test('under monoid', () =>
      laws.monoid(color.underMonoid, color.eq, colorBinArb));
  });
});
