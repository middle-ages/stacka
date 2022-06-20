import { function as FN } from 'fp-ts';
import { toString } from 'util/object';
import { assert, suite, test } from 'vitest';
import { draw } from '../draw';
import { prüferToTree } from '../enumerate';
import { mapTree } from '../ops';

suite('enumerate', () => {
  test('prüfer', () => {
    const seq = [1, 2, 3, 1];
    const actual = FN.pipe(seq, prüferToTree, mapTree(toString));
    assert.equal(
      draw(actual),
      `─┬─1
 ├──0
 ├─┬─3
 │ └─┬─2
 │   └──4
 └──5`,
    );
  });
});
