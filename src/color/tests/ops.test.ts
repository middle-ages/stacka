import { assert, suite, test } from 'vitest';
import * as color from '../color';
import { colorEq } from './helpers';

suite('color ops', () => {
  suite('colord ops', () => {
    test('invert', () => colorEq(color.invert('black'), 'white'));

    test('rotate', () =>
      colorEq(color.rotate(90)({ h: 90, s: 100, l: 50 }), {
        h: 180,
        s: 100,
        l: 50,
        a: 1,
      }));

    test('hue', () => colorEq(color.hue(0)('yellow'), 'red'));
  });

  suite('opacity', () => {
    suite('opaque', () => {
      const opaque = color.opaque(0);

      test('“a” lens', () => assert.equal(color.a.get(opaque), 255));

      test('“opacity” lens', () => assert.equal(color.opacity.get(opaque), 1));
    });

    suite('semiTransparent', () => {
      const semi = color.semiTransparent('yellow');

      test('“a” lens', () => assert.equal(color.a.get(semi), 51));
    });
  });
});
