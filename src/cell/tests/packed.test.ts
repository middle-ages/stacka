import { assert, suite, test } from 'vitest';
import * as BU from '../build';
import * as IUT from '../packed';
import { Cell } from '../types';

suite('grid cell packed', () => {
  const testRoundTrip = (name: string, cell: Cell) => {
    const buffer = new Uint32Array(4);
    IUT.writeCell(buffer)(0, cell);
    test(name, () => assert.deepEqual(IUT.readCell(buffer)(0), cell));
  };

  testRoundTrip('none', BU.none);

  testRoundTrip('one byte narrow char', BU.plainChar('a'));
  testRoundTrip('two byte narrow char', BU.plainChar('φ'));
  testRoundTrip('three byte narrow char', BU.plainChar('⤖'));

  testRoundTrip(
    'red fg three byte narrow char',
    BU.fgChar(0xff_00_00_ff)('⤖')[0],
  );
});
