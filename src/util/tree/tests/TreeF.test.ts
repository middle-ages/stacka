import { function as FN } from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import { increment } from 'fp-ts/lib/function';
import * as TR from 'util/tree';
import { assert, suite, test } from 'vitest';

suite('TreeF', () => {
  const basic = TR.treeF([1, [2, 3]]);

  const setNodes = FN.pipe(basic, flip(TR.nodesF<number, number>().set));
  const setValue = FN.pipe(basic, flip(TR.valueF<number, number>().set));

  suite('basic', () => {
    test('value', () => assert.deepEqual(basic.value, 1));
    test('nodes', () => assert.deepEqual(basic.nodes, [2, 3]));

    test('setValue', () => assert.deepEqual(setValue(4).value, 4));
    test('setNodes', () => assert.deepEqual(setNodes([5, 6]).nodes, [5, 6]));

    test('setValue does not change nodes', () =>
      assert.deepEqual(setValue(4).nodes, [2, 3]));
    test('setNodes does not change value', () =>
      assert.deepEqual(setNodes([5, 6]).value, 1));

    test('mapValue', () =>
      assert.deepEqual(FN.pipe(basic, TR.mapValueF(increment)).value, 2));
  });
});
