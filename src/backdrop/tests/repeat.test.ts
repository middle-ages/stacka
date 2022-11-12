import { function as FN } from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import * as GR from 'src/grid';
import { Grid } from 'src/grid';
import { Binary } from 'util/function';
import { assert, suite, test } from 'vitest';
import { asStrings } from '../paint';
import { repeat } from '../types';

suite('backdrop repeat', () => {
  const image: Grid = GR.parseRows('left', ['AB', 'CD']);

  const apply: Binary<number, number, string[]> = (width, height) =>
    FN.pipe(image, repeat, FN.pipe({ width, height }, flip(asStrings)));

  test('repeat', () =>
    assert.deepEqual(apply(4, 5), ['ABAB', 'CDCD', 'ABAB', 'CDCD', 'ABAB']));

  test('crop', () => assert.deepEqual(apply(3, 1), ['ABA']));
});
