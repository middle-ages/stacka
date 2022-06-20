import { array as AR, function as FN, option as OP } from 'fp-ts';
import {
  bounds,
  getCorners,
  posT,
  rect,
  rectBottom,
  rectRight,
  showRect,
  sizeFromCorners,
} from 'src/geometry';
import { pairMap, Tuple4 } from 'util/tuple';
import { assert, suite, test } from 'vitest';

const build = ([a, b, c, d]: Tuple4<number>) =>
  rect.fromQuad([
    [a, b],
    [c, d],
  ]);

/**
 *  ```txt
 *
 *  iut1235
 * ┄┄┄┄┄┄┄┄┄
 * ┌──234──┐
 * │⁺⁺⁺⁺⁺⁺⁺│
 * 1⁺⁺█░░⁺⁺│
 * 2⁺⁺░░░⁺⁺│
 * 3⁺⁺░░░⁺⁺│
 * 4⁺⁺░░░⁺⁺│
 * 5⁺⁺░░█⁺⁺│
 * │⁺⁺⁺⁺⁺⁺⁺│
 * └───────┘
 * ```
 */
const iut1235 = FN.pipe(
  [1, 2, 3, 5],
  build,
  FN.pipe('.', OP.some, rect.fillChar.set),
);

suite('rectangular', () => {
  test('show rect', () =>
    assert.equal(showRect.show(iut1235), '1:2 [w:3,h:5]'));
  test('rectBottom', () => assert.equal(rectBottom(iut1235), 5));
  test('rect/right', () => assert.equal(rectRight(iut1235), 4));
  test('toQuadOf', () => assert.deepEqual(rect.toTuple(iut1235), [1, 2, 3, 5]));
  test('getCorners', () =>
    assert.deepEqual(FN.pipe(iut1235, getCorners), [
      [1, 2],
      [5, 4],
    ]));
  test('∀ρ∈Rectangular: ρ ▷ getCorners•sizeFromCorners = ρ ▷ sizeLens•get', () =>
    assert.deepEqual(
      FN.pipe(iut1235, getCorners, pairMap(posT), sizeFromCorners),
      rect.size.get(iut1235),
    ));

  suite('bounds', () => {
    test('basic', () =>
      assert.deepEqual(
        FN.pipe(iut1235, AR.of, bounds),
        FN.pipe(iut1235, rect.fillChar.set(OP.none)),
      ));

    suite('3 rects', () => {
      /**
       *  ```txt
       *
       *    ←─╴7╶─→
       * ┌──2345678─┐
       * │⁺⁺⁺⁺⁺⁺⁺⁺⁺⁺│
       * 1⁺⁺█░░⁺⁺⁺⁺⁺1 ↑
       * 2⁺⁺░░█░░░░⁺2 │
       * 3⁺⁺░a▒░b░░⁺3 │
       * 4⁺⁺░░▒░░░█⁺4 ╵
       * 5⁺⁺░░█⁺⁺⁺⁺⁺5 9
       * │⁺⁺⁺⁺⁺⁺⁺⁺⁺⁺│ ╷
       * 7⁺⁺⁺⁺⁺⁺█░░⁺7 │
       * 8⁺⁺⁺⁺⁺⁺░c░⁺8 │
       * 9⁺⁺⁺⁺⁺⁺░░█⁺9 ↓
       * └──2345678─┘
       * ```
       */
      const abc = [
        build([1, 2, 3, 5]),
        build([2, 4, 5, 3]),
        build([7, 6, 3, 3]),
      ];

      test('bounds', () =>
        assert.deepEqual(FN.pipe(abc, bounds), build([1, 2, 7, 9])));
    });
  });
  test('paint', () =>
    assert.deepEqual(rect.paint(iut1235), ['...', '...', '...', '...', '...']));
});
