import ansis from 'ansis';
import { function as FN } from 'fp-ts';
import { assert, suite, test } from 'vitest';
import * as OP from '../ops';
import { Style } from '../types';

suite('grid style ops', () => {
  const red: Style = [0xff0000ff, 0, 0];
  const actual = FN.pipe('foo', OP.paint(red));

  test('paint', () => assert.equal(actual, ansis.hex('#ff0000')('foo')));
});
