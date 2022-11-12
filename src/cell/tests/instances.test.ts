import { array as AR } from 'fp-ts';
import * as laws from 'fp-ts-laws';
import { assert, suite, test } from 'vitest';
import * as BU from '../build';
import { eq, show } from '../instances';
import { cellArb } from './helpers';

suite('grid cell instances', () => {
  suite('show', () => {
    test('none', () => assert.equal(show.show(BU.none), 'none'));
    test('char', () =>
      assert.equal(show.show(BU.plainChar('x')), 'char: “x” style=∅'));
  });
  suite('laws', () => test('eq', () => laws.eq(AR.getEq(eq), cellArb)));
});
