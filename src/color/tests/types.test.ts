import { HslColor, RgbColor } from 'colord';
import { typedValues } from 'util/object';
import { suite, test } from 'vitest';
import * as IUT from '../types';
import { colorEq } from './helpers';

const yellow: IUT.Color = 0xff_00_ff_ff,
  yellowHsl: HslColor = { h: 60, s: 100, l: 50 },
  yellowRgb: RgbColor = { r: 255, g: 255, b: 0 };

suite('color types', () => {
  suite('normalize', () => {
    test('bin', () => colorEq(yellow, yellowRgb));

    test('named', () => colorEq('yellow', yellow));

    test('rgba', () => colorEq(yellowRgb, yellowHsl));

    test('rgb tuple', () => colorEq(typedValues(yellowRgb), yellow));

    test('hsla', () => colorEq({ ...yellowHsl, a: 255 }, yellow));
  });
});
