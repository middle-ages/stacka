import { array as AR, function as FN, tuple as TU } from 'fp-ts';
import { box, Box } from 'src/box';
import { pos } from 'src/geometry';
import { Pair } from 'util/tuple';
import { assert, suite, test } from 'vitest';

suite('pos', () => {
  test('subTop', () =>
    assert.equal(
      FN.pipe('foo', box.fromRow, box.subTop(42), box.top.get),
      -42,
    ));

  suite('normalize', () => {
    const noPos: Pair<Box> = [box.fromRow('fst'), box.fromRow('snd')];

    const setPos = FN.flow(pos, box.pos.set);

    test('one child', () => {
      const positioned = FN.pipe(noPos, TU.fst, setPos(-1, -1));

      const normalized = box.translateToPositive([positioned]);

      assert.deepEqual(FN.pipe(normalized, AR.map(box.pos.get)), [pos(0, 0)]);
    });

    test('negative', () => {
      const positioned = FN.pipe(noPos, TU.bimap(setPos(3, -2), setPos(-1, 5)));

      const normalized = box.translateToPositive(positioned);

      assert.deepEqual(FN.pipe(normalized, AR.map(box.pos.get)), [
        pos(0, 7),
        pos(4, 0),
      ]);
    });

    test('positive', () => {
      const positioned = FN.pipe(noPos, TU.bimap(setPos(3, 2), setPos(1, 5)));
      const normalized = box.translateToPositive(positioned);

      assert.deepEqual(FN.pipe(normalized, AR.map(box.pos.get)), [
        pos(1, 5),
        pos(3, 2),
      ]);
    });
  });
});
