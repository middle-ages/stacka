import { assert, suite, test } from 'vitest';
import { borderLines } from '../lines';

suite('border lines', () => {
  test('halfSolid', () =>
    assert.deepStrictEqual(borderLines('halfSolid'), {
      top: '▀',
      left: '▌',
      bottom: '▄',
      right: '▐',
    }));
  test('hHalfSolid', () =>
    assert.deepStrictEqual(borderLines('hHalfSolid'), {
      top: '▄',
      left: '▌',
      bottom: '▀',
      right: '▐',
    }));
});
