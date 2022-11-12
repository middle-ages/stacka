import * as fc from 'fast-check';
import { function as FN, number as NU } from 'fp-ts';
import { curry2 } from 'fp-ts-std/Function';
import { testProp } from 'util/test';
import { assert, suite, test } from 'vitest';
import * as IUT from '../rgba';
import { RgbaTuple } from '../rgba';
import { byteArb, colorBinArb } from './helpers';

suite('packed color', () => {
  suite('pack ', () => {
    test('empty', () => assert.equal(IUT.fromRgbaTuple([0, 0, 0, 0]), 0));

    test('opaque black', () =>
      assert.equal(IUT.fromRgbaTuple([0, 0, 0, 255]), 0xff000000));

    test('semi opaque red', () =>
      assert.equal(
        IUT.fromRgbaTuple([255, 0, 0, 128]),
        (255 | (128 << 24)) >>> 0,
      ));
  });

  suite('unpack ', () => {
    test('empty', () => assert.deepEqual(IUT.toRgbaTuple(0), [0, 0, 0, 0]));

    test('opaque white', () =>
      assert.deepEqual(IUT.toRgbaTuple(2 ** 32 - 1), [255, 255, 255, 255]));

    test('transparent white', () =>
      assert.deepEqual(IUT.toRgbaTuple(2 ** 32 - 1 - 255), [0, 255, 255, 255]));

    suite('semi opaque red', () => {
      const c: RgbaTuple = [255, 0, 0, 128];

      test('unpack', () => assert.deepEqual(IUT.toRgbaTuple(0x800000ff), c));

      test('red lens', () =>
        assert.deepEqual(IUT.r.get(IUT.fromRgbaTuple(c)), 255));

      test('opacity lens', () =>
        assert.deepEqual(IUT.a.get(IUT.fromRgbaTuple(c)), 128));
    });
  });

  test('blue lens set', () =>
    assert.equal(IUT.b.set(255)(0xff000000), 0xffff0000));

  testProp('unpack • pack = id', [colorBinArb], c =>
    FN.pipe(c, IUT.toRgbaTuple, IUT.fromRgbaTuple, curry2(NU.Eq.equals)(c)),
  );

  testProp('rgb.get = [r.get, g.get, b.get]', [colorBinArb], c =>
    assert.deepEqual(Array.from(IUT.rgb.get(c).values()), [
      IUT.r.get(c),
      IUT.g.get(c),
      IUT.b.get(c),
    ]),
  );

  testProp(
    '∀c ∈ ColorBin, ∀b ∈ byte: b ‣ blue.set(c) ‣ blue.get = b',
    [fc.tuple(byteArb, colorBinArb)],
    ([cur, orig]) => assert.equal(IUT.b.get(IUT.b.set(cur)(orig)), cur),
  );

  testProp(
    '∀c ∈ ColorBin: c ‣ green.get • green.set(c) = c',
    [colorBinArb],
    c => assert.equal(FN.pipe(c, FN.pipe(c, IUT.g.get, IUT.g.set)), c),
  );
});
