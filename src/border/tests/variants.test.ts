import { array as AR, function as FN } from 'fp-ts';
import { bitmap } from 'src/bitmap';
import { border } from 'src/border';
import { box } from 'src/box';
import { assert, suite, test } from 'vitest';
import { testBorder } from './helpers';

suite('border variants', () => {
  testBorder('hLines', border.hLines, [
    '─', //
    'X',
    '─',
  ]);

  testBorder('vLines', border.vLines, ['│X│']);

  test('hRule', () =>
    assert.deepEqual(FN.pipe(border.hRule(3), box.asStrings), [
      AR.replicate(3, bitmap.line.dash.wide.horizontal).join(''),
    ]));
});
