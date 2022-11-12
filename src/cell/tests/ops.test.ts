import { assert, suite, test } from 'vitest';
import * as IUT from '../ops';
import { Cell } from '../types';

suite('grid cell ops', () => {
  test('transparent', () => {
    const cell: Cell = [[0xff_00_00_00, 0, 1], 'x', 'char'];
    const res = IUT.fgOps.transparent(cell);
    assert.deepEqual(res, [[0x00_00_00_00, 0, 1], 'x', 'char']);
  });
});
