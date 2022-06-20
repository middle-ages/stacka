import { function as FN } from 'fp-ts';
import { assert, suite, test } from 'vitest';
import * as row from '../row';
import {
  resolution,
  emptyRow,
  fullRow,
  pxOff,
  resolutionRange,
} from '../../data';

suite('bitmap row ops', () => {
  suite('invert', () => {
    test('full', () => assert.deepEqual(row.invert(fullRow), emptyRow));
    test('empty', () => assert.deepEqual(row.invert(emptyRow), fullRow));
  });

  suite('countAt', () => {
    const countAll = row.countAt(resolutionRange);
    test('full', () => assert.equal(countAll(fullRow), resolution));
    test('empty', () => assert.equal(countAll(emptyRow), 0));
  });

  suite('isSymmetric', () => {
    test('full ⊤', () => assert.isTrue(row.isSymmetric(emptyRow)));
    test('empty ⊤', () => assert.isTrue(row.isSymmetric(emptyRow)));
    test('asymetric ⊥', () =>
      test('asymetric', () =>
        FN.pipe(
          fullRow,
          FN.pipe(2, FN.pipe(pxOff, FN.constant, row.mod)),
          row.isSymmetric,
          assert.isFalse,
        )));
  });
});
