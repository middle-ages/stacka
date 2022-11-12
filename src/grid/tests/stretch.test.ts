import { array as AR, function as FN } from 'fp-ts';
import { assert, suite, test } from 'vitest';
import * as CE from 'src/cell';
import { stretch } from '../stretch';
import * as TY from '../types';
import { gridEq } from './helpers';

suite('grid stretch', () => {
  test('empty + 1', () =>
    assert.deepEqual(TY.size(stretch({ width: 1, height: 1 })(TY.empty())), {
      width: 1,
      height: 1,
    }));

  suite('oneCell + 2x3', () => {
    const cell = CE.plainChar('x');

    const actual = FN.pipe(cell, TY.oneCell, stretch({ width: 2, height: 3 }));

    test('size', () => {
      assert.deepEqual(TY.size(actual), {
        width: 2,
        height: 3,
      });
    });

    const expect = TY.pack(AR.replicate(3, [cell, cell]));

    test('content', () => gridEq(actual, expect));
  });
});
