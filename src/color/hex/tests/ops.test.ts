import { hex, hexToRgba, isHex2, isHex3, isHex8 } from '../ops';

import { assert, suite, test } from 'vitest';

suite('hex ops', () => {
  suite('type guards', () => {
    suite('isHex2', () => {
      test('⊤ ', () => assert.isTrue(isHex2('#ff')));
      test('⊥ - short', () => assert.isFalse(isHex2('#8')));
      test('⊥ - long', () => assert.isFalse(isHex2('#ff0')));
    });
    suite('isHex3', () => {
      test('⊤ ', () => assert.isTrue(isHex3('#ff0')));
      test('⊥ - short', () => assert.isFalse(isHex3('#8')));
      test('⊥ - long', () => assert.isFalse(isHex3('#ff0f')));
    });
    suite('isHex8', () => {
      test('⊤ ', () => assert.isTrue(isHex8('#ff0ff050')));
      test('⊥ - short', () => assert.isFalse(isHex8('#f000000')));
      test('⊥ - long', () => assert.isFalse(isHex8('#f000000000')));
    });
  });
  suite('hexaToRgba', () => {
    const [hexa8Max, hexa4Max, hexa4Zero] = [
      hex('#ffffffff'),
      hex('#ffff'),
      hex('#0000'),
    ];

    test('hexa8', () =>
      assert.deepEqual(hexToRgba(hexa8Max), [255, 255, 255, 1]));

    suite('hexa4', () => {
      test('full', () =>
        assert.deepEqual(hexToRgba(hexa4Max), [255, 255, 255, 1]));
      test('empty', () => assert.deepEqual(hexToRgba(hexa4Zero), [0, 0, 0, 0]));
    });
  });
});
