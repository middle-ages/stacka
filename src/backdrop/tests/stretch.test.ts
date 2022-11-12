import { function as FN } from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import * as GR from 'src/grid';
import { Grid } from 'src/grid';
import stringWidth from 'string-width';
import { Binary } from 'util/function';
import { assert, suite, test } from 'vitest';
import { asStrings } from '../paint';
import { stretch } from '../types';

suite('backdrop stretch', () => {
  const image5x3 = GR.parseRows('center', ['{A..}', '{.B.}', '{..C}']);

  // build a backdrop from the given image, stretch it to the given width and
  // height, and paint it to a list of strings
  const apply =
    (image: Grid): Binary<number, number, string[]> =>
    (width, height) =>
      FN.pipe(image, stretch, FN.pipe({ width, height }, flip(asStrings)));

  const applyDiagonal = apply(image5x3);

  test('stretch', () =>
    assert.deepEqual(applyDiagonal(14, 4), [
      '{{{AAA......}}',
      '{{{AAA......}}',
      '{{{...BBB...}}',
      '{{{......CCC}}',
    ]));

  suite('shrink', () => {
    test('3,1', () => assert.deepEqual(applyDiagonal(3, 1), ['{.}']));
    test('2,2', () => assert.deepEqual(applyDiagonal(2, 2), ['{}', '{}']));
  });

  const testShrink = (image: string) => (width: number, expect: string) =>
    test(`${width} of ${stringWidth(image)}=${expect}`, () =>
      assert.deepEqual(apply(GR.parseRow(image))(width, 1), [expect]));

  testShrink('ABCDEFGHIJKL')(4, 'ADGL');
  testShrink('ABCDEFGHIJK')(5, 'ADFHK');

  suite('of 6', () => {
    const test6 = testShrink('ABCDEF');

    test6(3, 'ACF');
    test6(4, 'ACDF');
    test6(5, 'ACDEF');
  });

  suite('of 7', () => {
    const test7 = testShrink('ABCDEFG');

    test7(3, 'ADG');
    test7(4, 'ACEG');
    test7(5, 'ACDFG');
    test7(6, 'ACDEFG');
  });

  suite('of 13', () => {
    const test13 = testShrink('ABCDEFGHIJKLM');
    test13(3, 'AFM');
    test13(4, 'AEHM');
    test13(5, 'ADGIM');
    test13(6, 'ADFHJM');
    test13(7, 'ACEGIKM');
    test13(8, 'ACEFHJKM');
  });
});
