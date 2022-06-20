import { array as AR } from 'fp-ts';
import { assert, suite, test } from 'vitest';
import * as data from '../../data';
import * as switches from '../switches';
import { Matrix, PxRow } from '../../data/types';
import { Endo } from 'util/function';
import { dup } from 'fp-ts-std/Tuple';
import { showMatrix } from '../instances';

const show = showMatrix.show;

const check = (name: string, sw: Endo<Matrix>, expect: Matrix) =>
  test(name, () => assert.deepEqual(show(sw(data.fullMatrix)), show(expect)));

suite('bitmap switch ops', () => {
  check('left', switches.left, [
    ...AR.replicate(3, data.fullRow),
    ...dup(Array.from('##⁺#####') as PxRow),
    ...AR.replicate(3, data.fullRow),
  ] as Matrix);

  check('right', switches.right, [
    ...AR.replicate(3, data.fullRow),
    ...dup(Array.from('#####⁺##') as PxRow),
    ...AR.replicate(3, data.fullRow),
  ] as Matrix);

  check('top', switches.top, [
    ...AR.replicate(2, data.fullRow),
    Array.from('###⁺⁺###') as PxRow,
    ...AR.replicate(5, data.fullRow),
  ] as Matrix);

  check('bottom', switches.bottom, [
    ...AR.replicate(5, data.fullRow),
    Array.from('###⁺⁺###') as PxRow,
    ...AR.replicate(2, data.fullRow),
  ] as Matrix);
});
