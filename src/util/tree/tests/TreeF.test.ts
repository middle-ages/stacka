import { increment } from 'fp-ts/lib/function';
import { assert, suite, test } from 'vitest';
import { TreeF } from '../TreeF';

suite('TreeF', () => {
  const basic = TreeF.of([1, [2, 3]]);
  suite('basic', () => {
    test('value', () => assert.deepEqual(basic.value, 1));
    test('nodes', () => assert.deepEqual(basic.nodes, [2, 3]));

    test('setValue', () => assert.deepEqual(basic.setValue(4).value, 4));
    test('setNodes', () =>
      assert.deepEqual(basic.setNodes([5, 6]).nodes, [5, 6]));

    test('setValue does not change nodes', () =>
      assert.deepEqual(basic.setValue(4).nodes, [2, 3]));
    test('setNodes does not change value', () =>
      assert.deepEqual(basic.setNodes([5, 6]).value, 1));

    test('mapValue', () =>
      assert.deepEqual(basic.mapValue(increment).value, 2));
  });
});
