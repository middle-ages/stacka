import { assert, suite, test } from 'vitest';
import { parseRow, plainNarrow, plainWide } from '../build';

suite('grid cell build', () => {
  suite('parse', () => {
    test('narrow', () =>
      assert.deepEqual(parseRow('ab'), [plainNarrow('a'), plainNarrow('b')]));

    test('wide', () => assert.deepEqual(parseRow('🙂'), plainWide('🙂')));
  });
});
