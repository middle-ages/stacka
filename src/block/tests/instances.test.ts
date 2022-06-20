import { assert, suite, test } from 'vitest';
import { block } from 'src/block';
import { defaultBlendMode } from 'src/color/blend';

suite('block instances', () => {
  suite('show', () => {
    test('empty', () =>
      assert.deepEqual(
        block.show(block.empty),
        `▲0:◀0 ↔0:↕0 ⭹ ${defaultBlendMode} 0ˣ0 0%`,
      ));
  });
});
