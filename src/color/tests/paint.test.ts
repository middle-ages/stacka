import ansis from 'ansis';
import { function as FN } from 'fp-ts';
import { assert, suite, test } from 'vitest';
import { fg, of } from '../paint';

suite('color paint', () => {
  test('empty', () => assert.equal(FN.pipe('foo', fg(0)), 'foo'));

  test('transparent', () => assert.equal(FN.pipe('foo', of([0, 0])), 'foo'));

  test('yellow', () =>
    assert.equal(
      FN.pipe('foo', fg(0xff_00_ff_ff)),
      ansis.hex('#ffff00')('foo'),
    ));
});
