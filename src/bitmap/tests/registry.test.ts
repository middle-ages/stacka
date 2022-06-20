import { assert, suite, test } from 'vitest';
import * as DA from '../data';
import { registry as reg } from '../registry';

suite('matrix registry', () => {
  test('rolesByChar', () => assert.deepEqual(reg.rolesByChar('╯'), ['elbow']));

  test('chars', () => assert.isAbove(reg.chars.length, 100));

  test('getMatrix', () =>
    assert.deepEqual(reg.matrixByChar('█'), DA.fullMatrix));

  test('char with >1 roles', () =>
    assert.deepEqual(reg.rolesByChar(' '), ['hLine', 'vLine', 'halftone']));
});
