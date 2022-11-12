import { function as FN } from 'fp-ts';
import * as color from 'src/color';
import { BinOpT } from 'util/function';
import { Pair } from 'util/tuple';
import { assert, suite, test } from 'vitest';
import { blend } from '../blend';
import { bgLens, fgLens } from '../lens';
import * as TY from '../types';
import { Style } from '../types';

const iut: BinOpT<Style> = blend('difference');

const redOnWhite: Style = [0xff0000ff, 0xffffffff, 0];

export const check = (name: string, mixPair: Pair<Style>, expect: Style) =>
  suite(name, () => {
    const [actualFg, actualBg] = FN.pipe(mixPair, iut, TY.asColorPair);

    test('fg', () => assert.deepEqual(actualFg, fgLens.color.get(expect)));
    test('bg', () => assert.deepEqual(actualBg, bgLens.color.get(expect)));
  });

suite('“difference” blend mode', () => {
  check('none-none=none', [TY.empty, TY.empty], TY.empty);

  check('redOnWhite-none=redOnWhite', [redOnWhite, TY.empty], redOnWhite);

  check(
    'redOnWhite-redOnWhite=black',
    [redOnWhite, redOnWhite],
    [color.normalize('black'), color.normalize('black'), 0],
  );
});
