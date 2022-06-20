import { option as OP } from 'fp-ts';
import * as laws from 'fp-ts-laws';
import { assert, suite, test } from 'vitest';
import { style } from '../style';

suite('grid style instances', () => {
  test('show', () => {
    const iut = style({ fg: OP.some('red'), bg: OP.some('blue'), bold: true });
    assert.equal(
      style.show.show(iut),
      'fg: “R:255 G:0 B:0 A:1.00”, bg: “R:0 G:0 B:255 A:1.00”, bold',
    );
  });

  suite('laws', () => {
    test('eq', () => laws.eq(style.eq, style.arb));

    test('monoid', () => laws.monoid(style.monoid, style.eq, style.arb));

    test('under monoid', () =>
      laws.monoid(style.underMonoid, style.eq, style.arb));
  });
});
