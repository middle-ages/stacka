import { function as FN } from 'fp-ts';
import { assert, suite, test } from 'vitest';
import { emptyMatrix, fullMatrix } from '../../data';
import * as query from '../query';

suite('bitmap query ops', () => {
  suite('invertEq', () => {
    test('full→empty', () =>
      FN.pipe([fullMatrix, emptyMatrix], query.invertEq, assert.isTrue));
    test('empty→full', () =>
      FN.pipe([emptyMatrix, fullMatrix], query.invertEq, assert.isTrue));
  });
});
