import { assert, suite, test } from 'vitest';
import { bgLens, decoList, fgLens } from '../lens';
import * as color from 'src/color';
import * as TY from '../types';
import { Style } from '../types';

suite('grid style lens', () => {
  const red: Style = [color.normalize('red'), 0, 0];

  test('red', () => assert.deepEqual(fgLens.r.get(red), 255));

  test('bold off', () => assert.deepEqual(decoList.get(red), []));

  test('empty', () => assert.deepEqual(bgLens.a.get(TY.empty), 0));
});
