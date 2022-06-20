import { box, Box } from 'src/box';
import { grid } from 'src/grid';
import { Unary } from 'util/function';
import { assert, test } from 'vitest';

export const paint: Unary<Box, string[]> = box.asStringsWith('.');

export const showGrid = grid.asStringsWith('.');

export const testPaint = (name: string, iut: Box, expect: string[]) => {
  const actual = paint(iut);
  test(name, () => assert.deepEqual(actual, expect));
};

export const testPaints = (
  ...tests: [name: string, init: Box, expect: string[]][]
) => {
  for (const [name, init, expect] of tests) testPaint(name, init, expect);
};
