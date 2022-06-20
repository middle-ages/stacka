import { array as AR } from 'fp-ts';
import { assert, suite, test } from 'vitest';
import { parseDef } from '../parse';
import { Matrix, resolution, toBin } from '../types';

const matrix: Matrix = parseDef([
  '########',
  '########',
  '########',
  '########',
  '########',
  '########',
  '########',
  '########',
]);

suite('bitmap data parse', () => {
  test('basic', () =>
    assert.equal(
      toBin(matrix),
      AR.replicate(resolution * resolution, '1').join(''),
    ));
});
