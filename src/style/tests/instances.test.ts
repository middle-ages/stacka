import * as laws from 'fp-ts-laws';
import * as color from 'src/color';
import { testProp } from 'util/test';
import { assert, suite, test } from 'vitest';
import * as DE from '../deco';
import * as IUT from '../instances';
import { Style } from '../types';
import { styleArb } from './helpers';

suite('grid style instances', () => {
  test('show', () => {
    const iut: Style = [
      color.fromName('red'),
      color.fromName('blue'),
      DE.listToDeco(['bold']),
    ];

    assert.equal(
      IUT.show.show(iut),
      'R:255 G:0 B:0 A:1.00, R:0 G:0 B:255 A:1.00, bold',
    );
  });

  testProp('style eq', [styleArb], st => IUT.eq.equals(st, st));

  suite('laws', () => {
    test('eq', () => laws.eq(IUT.eq, styleArb));

    test('overMonoid', () => laws.monoid(IUT.overMonoid, IUT.eq, styleArb));

    test('underMonoid', () => laws.monoid(IUT.underMonoid, IUT.eq, styleArb));
  });
});
