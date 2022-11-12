import { assert, suite, test } from 'vitest';
import * as ST from 'src/style';
import * as TY from '../types';
import { Cell } from '../types';

const cell: Cell = [ST.empty, '', 'none'];

suite('grid cell types', () => {
  test('empty cell has empty deco', () => assert.equal(TY.getDeco(cell), 0));
  test('setDeco', () => assert.equal(TY.getDeco(TY.setDeco(1)(cell)), 1));
});
