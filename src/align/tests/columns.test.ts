import { function as FN } from 'fp-ts';
import { size } from 'src/geometry';
import { assert, suite, test } from 'vitest';
import { alignColumns } from '../columns';
import { VAlign } from '../types';

suite('alignColumns', () => {
  const columns = [['A', 'AB', 'ABC'], ['D'], ['E', 'F']];
  const apply = (vAlign: VAlign) =>
    FN.pipe(columns, FN.pipe([3, 4], size, alignColumns(vAlign)));

  suite('3 columns', () => {
    test('bottom', () =>
      assert.deepEqual(apply('bottom'), [
        ['', 'A', 'AB', 'ABC'],
        ['', '', '', 'D'],
        ['', '', 'E', 'F'],
      ]));

    test('middle', () =>
      assert.deepEqual(apply('middle'), [
        ['A', 'AB', 'ABC', ''],
        ['', 'D', '', ''],
        ['', 'E', 'F', ''],
      ]));

    test('top', () =>
      assert.deepEqual(apply('top'), [
        ['A', 'AB', 'ABC', ''],
        ['D', '', '', ''],
        ['E', 'F', '', ''],
      ]));
  });
});
