import { assert, suite, test } from 'vitest';
import * as CE from 'src/cell';
import { Cell } from 'src/cell';
import * as TY from '../types';

suite('grid types', () => {
  test('empty row count', () => assert.equal(TY.countRows(TY.empty()), 0));

  test('size', () =>
    assert.deepEqual(TY.size(TY.sized({ width: 3, height: 4 })), {
      width: 3,
      height: 4,
    }));

  suite('pack/unpack', () => {
    const testRoundTrip = (name: string, cells: Cell[][]) =>
      test(name, () => assert.deepEqual(TY.unpack(TY.pack(cells)), cells));

    testRoundTrip('one empty cell', [[CE.none]]);

    testRoundTrip('one narrow red cell', [CE.fgChar(0xff_00_00_ff)('x')]);
  });
});
