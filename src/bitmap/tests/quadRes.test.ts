import { function as FN } from 'fp-ts';
import { assert, suite, test } from 'vitest';
import { quadRes } from '../quadRes';
import { registry as reg } from '../registry';

suite('quad resolution', () => {
  const iut = FN.flow(reg.matrixByChar, quadRes);
  suite('unframed', () => {
    test('solid', () =>
      assert.deepEqual(iut(reg.solid), [
        '████', //
        '████',
        '████',
        '████',
      ]));

    test('cross', () =>
      assert.deepEqual(iut('┼'), [
        ' ▐▌ ', //
        '▄▟▙▄',
        '▀▜▛▀',
        ' ▐▌ ',
      ]));
  });
});
