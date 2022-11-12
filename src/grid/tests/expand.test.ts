import { function as FN, array as AR } from 'fp-ts';
import { assert, suite, test } from 'vitest';
import * as IUT from '../expand';
import * as TY from '../types';
import * as CE from 'src/cell';
import { get } from '../ops';

suite('grid expand', () => {
  test('empty + 1', () =>
    assert.deepEqual(
      TY.size(IUT.expand({ top: 1, right: 1, bottom: 0, left: 0 })(TY.empty())),
      { width: 1, height: 1 },
    ));

  test('align center/middle', () =>
    assert.deepEqual(
      FN.pipe(
        'x',
        CE.plainChar,
        AR.of,
        AR.of,
        TY.pack,
        IUT.expand({ top: 1, right: 1, bottom: 1, left: 1 }),
        get([1, 1]),
        CE.rune.get,
      ),
      'x',
    ));
});
