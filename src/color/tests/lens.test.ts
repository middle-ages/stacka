import { HslColor, RgbColor } from 'colord';
import * as fc from 'fast-check';
import { function as FN } from 'fp-ts';
import { testProp } from 'util/test';
import { assert, suite, test } from 'vitest';
import * as IUT from '../lens';
import { byteArb, colorEq, rgbaTupleArb } from './helpers';

const yellowHsl: HslColor = { h: 60, s: 100, l: 50 };

const yellowRgb: RgbColor = { r: 255, g: 255, b: 0 };

suite('lens', () => {
  suite('l', () => {
    test('get', () => assert.equal(IUT.l.get('yellow'), 50));

    test('set', () => colorEq(IUT.l.set(100)('yellow'), 'white'));
  });

  suite('hue', () => {
    test('get', () => assert.equal(IUT.h.get(yellowRgb), 60));

    test('set.get', () =>
      assert.equal(FN.pipe([0, 100, 50, 0], IUT.h.set(1), IUT.h.get), 1));
  });

  suite('hsl', () => {
    test('get', () =>
      assert.deepEqual(IUT.hsl.get({ ...yellowHsl, a: 0 }), yellowHsl));

    test('set.get', () =>
      assert.equal(FN.pipe([0, 100, 50, 0], IUT.h.set(1), IUT.h.get), 1));
  });

  testProp(
    '∀c ∈ RgbaTuple, ∀b ∈ byte: b ‣ g.set(c) ‣ g.get = b',
    [fc.tuple(byteArb, rgbaTupleArb)],
    ([cur, orig]) => {
      const actual = FN.pipe(orig, IUT.g.set(cur), IUT.g.get);
      assert.equal(actual, cur);
    },
  );
});
