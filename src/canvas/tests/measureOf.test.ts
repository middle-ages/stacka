import { function as FN } from 'fp-ts';
import { size } from 'src/geometry';
import { assert, suite, test } from 'vitest';
import { canvas, egCanvas } from './helpers';

suite('canvas measureOf', () =>
  test('measure 4 rects', () =>
    assert.deepEqual(FN.pipe(egCanvas, canvas.measure), size([5, 4]))),
);
