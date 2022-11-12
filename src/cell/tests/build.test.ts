import { assert, suite, test } from 'vitest';
import * as ST from 'src/style';
import { plainChar, plainWide } from '../build';

suite('grid cell build', () => {
  test('plainChar', () =>
    assert.deepEqual(plainChar('x'), [ST.empty, 'x', 'char']));

  test('wide', () =>
    assert.deepEqual(plainWide('🙂'), [
      [ST.empty, '🙂', 'wide'],
      [ST.empty, '', 'cont'],
    ]));
});
