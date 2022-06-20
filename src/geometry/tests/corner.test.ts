import { corner } from 'src/geometry';
import { assert, suite, test } from 'vitest';

suite('corner', () => {
  test('basic', () => assert.equal(corner.bottomRight, 'bottomRight'));

  test('show', () => assert.equal(corner.show.show(corner.bottomLeft), '↙'));
});
