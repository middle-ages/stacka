import { assert, suite, test } from 'vitest';
import { canvas, egCanvas } from './helpers';

suite('canvas render', () => {
  const actual = canvas.paint(egCanvas);

  test('render 4 rects', () =>
    assert.deepEqual(actual, ['A..D.', '...DC', '...CC', 'B..CC']));
});
