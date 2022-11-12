import { array as AR, function as FN } from 'fp-ts';
import { assert, suite, test } from 'vitest';
import * as CE from 'src/cell';
import { shrink } from '../shrink';
import * as TY from '../types';
import { gridEq } from './helpers';

const makeGrid = FN.flow(FN.pipe(CE.plainChar, AR.map, AR.map), TY.pack);

suite('grid shrink', () => {
  suite('6x4 ⇒ 3x2', () => {
    const source = makeGrid([
      ['a', 'b', 'c', 'd', 'e', 'f'],
      ['g', 'h', 'i', 'j', 'k', 'l'],
    ]);

    const actual = FN.pipe(source, shrink({ width: 3, height: 2 }));

    test('size', () => {
      assert.deepEqual(TY.size(actual), {
        width: 3,
        height: 2,
      });
    });

    const expect = makeGrid([
      ['a', 'c', 'f'],
      ['g', 'i', 'l'],
    ]);

    test('content', () => gridEq(actual, expect));
  });
});
