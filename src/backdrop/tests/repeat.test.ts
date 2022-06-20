import { function as FN } from 'fp-ts';
import { grid, Grid } from 'src/grid';
import { Binary } from 'util/function';
import { assert, suite, test } from 'vitest';
import { repeat } from '../repeat';

const cell = grid.cell;

suite('backdrop repeat', () => {
  const image: Grid = cell.parseRows(['AB', 'CD']);

  const apply: Binary<number, number, string[]> = (width, height) =>
    FN.pipe(image, repeat({ width, height }), grid.asStrings);

  test('repeat', () =>
    assert.deepEqual(apply(4, 5), ['ABAB', 'CDCD', 'ABAB', 'CDCD', 'ABAB']));

  test('crop', () => assert.deepEqual(apply(3, 1), ['ABA']));
});
