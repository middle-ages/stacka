import { assert, suite, test } from 'vitest';
import { decode, encode } from '../rune';

suite('grid cell rune', () => {
  const testRoundTrip = (name: string, char: string) =>
    test(`${name}: โ${char}โ`, () => assert.equal(decode(encode(char)), char));

  testRoundTrip('empty', '');
  testRoundTrip('1 byte', 'a');
  testRoundTrip('2 byte', 'ฯ');
  testRoundTrip('3 byte', 'โค');
  testRoundTrip('4 byte', '๐');
});
