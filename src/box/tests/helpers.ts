import { Box } from '../types';
import * as GR from 'src/grid';
import { Unary } from 'util/function';
import { assert, test } from 'vitest';
import * as PA from '../paint';

export const paint: Unary<Box, string[]> = PA.asStringsWith('.');

export const showGrid = GR.paintWith('.');

export const testPaint = (name: string, iut: Box, expect: string[]) => {
  const actual = paint(iut);
  test(name, () => assert.deepEqual(actual, expect));
};

export const testPaints = (
  ...tests: [name: string, init: Box, expect: string[]][]
) => {
  for (const [name, init, expect] of tests) testPaint(name, init, expect);
};
