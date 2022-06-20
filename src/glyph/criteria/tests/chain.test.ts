import { Pair } from 'util/tuple';
import { test, assert, suite } from 'vitest';
import { extractChains } from '../chain';

suite('chain', () => {
  test('basic', () => {
    const iut: Pair<string>[] = [
      ['a', 'b'],
      ['b', 'c'],
    ];
    const actual = extractChains(iut);

    assert.deepEqual(actual, [['a', 'b', 'c']]);
  });

  test('symmetric pairs ignored', () => {
    const iut: Pair<string>[] = [
      ['a', 'b'],
      ['b', 'a'],
    ];
    const actual = extractChains(iut);

    assert.deepEqual(actual, [['a', 'b']]);
  });

  test('two chains', () => {
    const iut: Pair<string>[] = [
      ['y', 'z'],
      ['b', 'c'],
      ['a', 'b'],
      ['x', 'y'],
    ];
    const actual = extractChains(iut);

    assert.deepEqual(actual, [
      ['x', 'y', 'z'],
      ['a', 'b', 'c'],
    ]);
  });

  test('connect chains', () => {
    const iut: Pair<string>[] = [
      ['a', 'b'],
      ['d', 'e'],
      ['b', 'c'],
      ['c', 'd'],
    ];
    const actual = extractChains(iut);

    assert.deepEqual(actual, [['a', 'b', 'c', 'd', 'e']]);
  });

  test('two chains starting from same character', () => {
    const iut: Pair<string>[] = [
      ['a', 'b'],
      ['c', 'd'],
      ['a', 'z'],
      ['z', 'y'],
      ['y', 'x'],
      ['b', 'c'],
    ];
    const actual = extractChains(iut);

    assert.deepEqual(actual, [
      ['a', 'b', 'c', 'd'],
      ['a', 'z', 'y', 'x'],
    ]);
  });
});
