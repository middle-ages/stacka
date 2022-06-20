import { array as AR, function as FN } from 'fp-ts';
import { assert, suite, test } from 'vitest';
import { showMatrix } from '../instances';
import * as matrix from '../matrix';
import {
  fullMatrix,
  halfRes,
  resolution,
  fullRow,
  pxOn,
  PxRow,
  pxOff,
  Matrix,
} from '../../data';

suite('bitmap matrix ops', () => {
  test('invertPxAt', () => {
    const actual = FN.pipe(
      fullMatrix,
      matrix.invertPxAt([0, 3]),
      matrix.invertPxAt([0, 4]),
      showMatrix.show,
    );

    const expect = showMatrix.show([
      [
        ...AR.replicate(halfRes - 1, pxOn),
        pxOff,
        pxOff,
        ...AR.replicate(halfRes - 1, pxOn),
      ] as PxRow,
      ...AR.replicate(resolution - 1, fullRow),
    ] as Matrix);

    assert.deepEqual(actual, expect);
  });
});
