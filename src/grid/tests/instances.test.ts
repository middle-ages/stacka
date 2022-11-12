import * as laws from 'fp-ts-laws';
import { align as AL } from 'src/align';
import { assert, suite, test } from 'vitest';
import * as IUT from '../instances';
import { resize } from '../resize';
import { narrowRed1x1, narrowGridArb } from './helpers';

suite('grid instances', () => {
  test('show', () => {
    const ninth = resize(AL.middleCenter)({ width: 3, height: 3 })(
      narrowRed1x1,
    );
    assert.equal(IUT.show.show(ninth), '3ˣ3 11% non-empty');
  });

  suite('laws', () => {
    test('eq', () => laws.eq(IUT.eq, narrowGridArb));
  });
});
