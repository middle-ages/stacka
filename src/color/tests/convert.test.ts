import { function as FN } from 'fp-ts';
import { color } from 'src/color';
import { assert, suite, test } from 'vitest';

suite('color convert', () => {
  test('toHwb ↔ toRgb, within accuracy', () =>
    assert.deepEqual(
      FN.pipe('red', color.normalize, color.toHwba, color.normalize),
      color.normalize('red'),
    ));
});
