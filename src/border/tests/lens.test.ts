import { function as FN, option as OP } from 'fp-ts';
import { border, emptyBorder } from 'src/border';
import { noColor } from 'util/color';
import { assert, suite, test } from 'vitest';

suite('lens', () => {
  test('basic', () =>
    assert.deepEqual(FN.pipe(emptyBorder, border.get('top')), [
      OP.none,
      noColor,
    ]));
});
