import { array as AR, function as FN, number as NU } from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import { box, Cat, Box } from 'src/box';
import { boxes } from 'src/boxes';
import { mapRange } from 'util/array';
import { Unary } from 'util/function';
import { assert, suite, test } from 'vitest';

const runTest =
  (boxWidth: number, name: string, f: Unary<number, Cat>) =>
  (available: number, boxCount: number, expect: string[]) => {
    test(`${name} wanted:${boxCount}, available:${available}`, () => {
      const actual = FN.pipe(
        FN.flow(NU.Show.show, box.fromRow),
        FN.pipe([0, boxCount - 1], flip(mapRange<Box>)),
        FN.pipe(boxWidth, box.width.set, AR.map),
        f(available),
        box.asStringsWith('.'),
      );
      assert.deepEqual(actual, expect);
    });
  };

const testFlow = runTest(1, 'flow', boxes.flow);
const testHGap = runTest(1, 'hGap', boxes.flow.hGap(2));

suite('flow placement combinator', () => {
  testFlow(5, 3, ['012']);
  testFlow(2, 3, ['01', '2.']);
  testFlow(2, 4, ['01', '23']);
  testFlow(2, 5, ['01', '23', '4.']);
  testFlow(3, 4, ['012', '3..']);
  testFlow(3, 7, ['012', '345', '6..']);

  testHGap(4, 2, ['0..1']);
  testHGap(4, 5, ['0..1', '2..3', '4...']);
});
