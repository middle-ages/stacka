import { function as FN } from 'fp-ts';
import { Pair, pairMap } from 'util/tuple';
import { assert, suite, test } from 'vitest';
import { minPos, pos, posOrd, posT, showPos } from '../pos';

const show = showPos.show;

suite('pos', () => {
  test('basic', () => assert.equal(showPos.show(pos(1, 2)), '1:2'));

  suite('ord', () => {
    const sortsFirst = (...pair: Pair<Pair<number>>) => {
      const [fst, snd] = FN.pipe(pair, pairMap(posT));
      test(`${show(fst)} <> ${show(snd)}`, () =>
        assert.equal(posOrd.compare(fst, snd), -1));
    };

    sortsFirst([1, 2], [3, 4]);
    sortsFirst([1, 2], [2, 2]);
    sortsFirst([1, 3], [2, 2]);
  });

  test('minPos', () => {
    const points = [pos(1, 5), pos(3, 2), pos(3, 3)];
    const actual = minPos(points);
    assert.deepEqual(actual, pos(1, 2));
  });
});
