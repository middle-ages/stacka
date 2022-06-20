import * as laws from 'fp-ts-laws';
import { assert, suite, test } from 'vitest';
import { cell } from '../cell';

const show = cell.show.show;

suite('grid cell instances', () => {
  suite('show', () => {
    test('none', () => assert.equal(show(cell.empty), 'none'));
    test('char', () =>
      assert.equal(show(cell.plainNarrow('a')), 'char: “a”, style=∅'));
  });

  suite('laws', () => test('eq', () => laws.eq(cell.eq, cell.narrowOrNoneArb)));
});
