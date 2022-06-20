import { function as FN } from 'fp-ts';
import { grid, Grid } from 'src/grid';
import { Binary } from 'util/function';
import { assert, suite, test } from 'vitest';
import { center } from '../center';

suite('backdrop center', () => {
  const image: Grid = [grid.cell.parseRow('ABC')];

  const apply: Binary<number, number, string[]> = (width, height) =>
    FN.pipe(image, center({ width, height }), grid.asStrings);

  test('center', () =>
    assert.deepEqual(apply(6, 5), [
      '      ',
      '      ',
      ' ABC  ',
      '      ',
      '      ',
    ]));

  test('crop', () => assert.deepEqual(apply(1, 1), ['B']));
});
