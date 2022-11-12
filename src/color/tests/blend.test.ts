import { Unary } from 'util/function';
import { suite, test } from 'vitest';
import { blend, BlendMode } from '../blend';
import { Color } from '../types';
import { colorEq } from './helpers';

const transparent: Color = { r: 255, g: 0, b: 0, a: 0 },
  semiOpaqueGreen: Color = { r: 0, g: 255, b: 0, a: 0.5 };

export const cs: Unary<Color, string> = s => Object.values(s).join(',');

const checkPair =
  (name: string, lower: Color, upper: Color) =>
  (mode: BlendMode, expect: Color) =>
    test(name, () => colorEq(blend(mode)([lower, upper]), expect));

suite('color blend ops', () => {
  suite('transparent', () => {
    suite('lower', () => {
      const check = checkPair('transparent+red', transparent, 'red');
      check('under', transparent);
      check('normal', 'red');
      check('multiply', 'red');
    });

    suite('upper', () => {
      const check = checkPair('red+transparent', 'red', transparent);
      check('over', transparent);
      check('under', 'red');
      check('multiply', 'red');
    });
  });

  suite('opaque', () => {
    const check = checkPair('red+blue', 'red', 'blue');
    check('over', 'blue');
    check('combineUnder', 'red');
    check('lighten', { r: 255, g: 0, b: 255, a: 1 });
  });

  suite('opaque + semi opaque', () => {
    const check = checkPair('red+semiOpaqueGreen', 'red', semiOpaqueGreen);
    check('over', semiOpaqueGreen);
    check('difference', { r: 255, g: 128, b: 0, a: 1 });
  });
});
