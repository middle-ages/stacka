import { assert, suite, test } from 'vitest';
import { decode, encode } from '../rune';

suite('grid cell rune', () => {
  const testRoundTrip = (name: string, char: string) =>
    test(`${name}: “${char}”`, () => assert.equal(decode(encode(char)), char));

  testRoundTrip('empty', '');
  testRoundTrip('1 byte', 'a');
  testRoundTrip('2 byte', 'φ');
  testRoundTrip('3 byte', '⤖');
  testRoundTrip('4 byte', '🙂');
});
