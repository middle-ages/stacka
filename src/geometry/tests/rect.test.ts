import * as laws from 'fp-ts-laws';
import { function as FN } from 'fp-ts';
import { pos, rect } from 'src/geometry';
import { assert, suite, test } from 'vitest';
import { mapBoth } from 'fp-ts-std/Tuple';

/**
 *  ```txt
 *
 *  iut1235     iut1224
 * ┄┄┄┄┄┄┄┄┄   ┄┄┄┄┄┄┄┄┄
 * ┌──234──┐   ┌──23──┐
 * │⁺⁺⁺⁺⁺⁺⁺│   │⁺⁺⁺⁺⁺⁺│
 * 1⁺⁺░░░⁺⁺│   1⁺⁺░░⁺⁺│
 * 2⁺⁺░░░⁺⁺│   2⁺⁺░░⁺⁺│
 * 3⁺⁺░░░⁺⁺│   3⁺⁺░░⁺⁺│
 * 4⁺⁺░░░⁺⁺│   4⁺⁺░░⁺⁺│
 * 5⁺⁺░░░⁺⁺│   │⁺⁺⁺⁺⁺⁺│
 * │⁺⁺⁺⁺⁺⁺⁺│   └──────┘
 * └───────┘
 * ```
 */
const iut1235 = FN.pipe([1, 2, 3, 5], rect.fromTuple),
  iut1224 = FN.pipe([1, 2, 2, 4], rect.fromTuple);

suite('rect', () => {
  test('show', () => assert.equal(rect.show.show(iut1235), '▲1:◀2 ↔3:↕5'));

  test('bottomRight', () =>
    assert.deepEqual(rect.bottomRight.get(iut1235), pos(5, 4)));

  test('equals', () => assert.isTrue(rect.eq.equals(iut1235, iut1235)));

  test('fromCorners', () =>
    assert.deepEqual(rect.fromCorners([pos(1, 2), pos(5, 4)]), iut1235));

  test('corners', () =>
    assert.deepEqual(rect.corners(iut1235), [pos(1, 2), pos(5, 4)]));

  test('setRight', () =>
    assert.deepEqual(FN.pipe(iut1235, rect.right.set(0), rect.corners), [
      pos(1, -2),
      pos(5, 0),
    ]));

  test('setBottomRight', () =>
    assert.deepEqual(
      FN.pipe(iut1235, rect.bottomRight.set(pos(4, 2)), rect.pos.get),
      pos.origin,
    ));

  suite('center', () => {
    suite('get', () => {
      test('odd', () =>
        assert.deepEqual(rect.middleCenter.get(iut1235), pos(3, 3)));

      test('even', () =>
        assert.deepEqual(rect.middleCenter.get(iut1224), pos(2, 2)));
    });

    suite('set', () => {
      /**
       *  ```txt
       *          iut1235                      iut1224
       * ┄┄┄┄┄┄┄┄┄┄┄┄┬┄┄┄┄┄┄┄┄┄┄┄┄┄┄   ┄┄┄┄┄┄┄┄┄┄┄┄┬──┄┄┄┄┄┄┄┄┄┄┄
       * before move ┊  after center   before move ┊ after center
       *             ┊   on origin                 ┊  on origin
       *             ┊                             ┊
       *     ⁺⁺⁺     ┊     ⁻ ⁺             ⁺⁺      ┊      ⁺
       *  ┌──234──┐  ┊  ┌──101──┐       ┌──23──┐   ┊  ┌──01──┐
       *  │⁺⁺⁺⁺⁺⁺⁺│  ┊  │⁺⁺⁺⁺⁺⁺⁺│       │⁺⁺⁺⁺⁺⁺│   ┊  │⁺⁺⁺⁺⁺⁺│
       * ⁺1⁺⁺░░░⁺⁺│  ┊ ⁻2⁺⁺░░░⁺⁺│      ⁺1⁺⁺░░⁺⁺│   ┊ ⁻1⁺⁺░░⁺⁺│
       * ⁺2⁺⁺░░░⁺⁺│  ┊ ⁻1⁺⁺░░░⁺⁺│      ⁺2⁺⁺░░⁺⁺│   ┊  0⁺⁺░░⁺⁺│
       * ⁺3⁺⁺░░░⁺⁺│  ┊  0⁺⁺░░░⁺⁺│      ⁺3⁺⁺░░⁺⁺│   ┊ ⁺1⁺⁺░░⁺⁺│
       * ⁺4⁺⁺░░░⁺⁺│  ┊ ⁺1⁺⁺░░░⁺⁺│      ⁺4⁺⁺░░⁺⁺│   ┊ ⁺2⁺⁺░░⁺⁺│
       * ⁺5⁺⁺░░░⁺⁺│  ┊ ⁺2⁺⁺░░░⁺⁺│       │⁺⁺⁺⁺⁺⁺│   ┊  │⁺⁺⁺⁺⁺⁺│
       *  │⁺⁺⁺⁺⁺⁺⁺│  ┊  │⁺⁺⁺⁺⁺⁺⁺│       └──────┘   ┊  └──────┘
       *  └───────┘  ┊  └───────┘
       */
      const move = rect.middleCenter.set(pos.origin),
        [movedOdd, movedEven] = FN.pipe([iut1235, iut1224], mapBoth(move));

      test('odd', () => assert.deepEqual(rect.pos.get(movedOdd), pos(-2, -1)));

      test('even', () => assert.deepEqual(rect.pos.get(movedEven), pos(-1, 0)));
    });
  });

  test('corners and size', () =>
    assert.deepEqual(
      FN.pipe(iut1235, rect.corners, pos.rectSize),
      rect.size.get(iut1235),
    ));

  suite('equality', () => {
    test('eq', () => assert.isTrue(rect.eq.equals(iut1235, iut1235)));
    test('eqPos', () => assert.isTrue(rect.eqPos.equals(iut1235, iut1235)));
    test('eqSize', () => assert.isTrue(rect.eqSize.equals(iut1235, iut1235)));
  });

  suite('add', () => {
    test('this ⊕ this = this', () =>
      assert.deepEqual(FN.pipe(iut1235, rect.addC(iut1235)), iut1235));

    test('this ⊕ ∅ = this', () =>
      assert.deepEqual(FN.pipe(iut1235, rect.addC(rect.empty)), iut1235));

    test('∅ ⊕ this = this', () =>
      assert.deepEqual(FN.pipe(rect.empty, rect.addC(iut1235)), iut1235));

    test('this ⊕ translate(this)', () => {
      const translated = FN.pipe(iut1235, FN.flow(pos, rect.addPos)(1, 1));

      assert.deepEqual(
        FN.pipe(iut1235, rect.addC(translated)),
        FN.pipe(iut1235, rect.addWidth(1), rect.addHeight(1)),
      );
    });

    test('this ⊕ smaller(this) = this', () =>
      assert.deepEqual(
        rect.stack([
          iut1235,
          FN.pipe(iut1235, rect.subWidth(1), rect.subHeight(2)),
        ]),
        iut1235,
      ));

    test('stack', () => {
      /**
       *  ```txt
       *         ←─╴7╶─→
       *      ┌──2345678─┐
       *      │⁺⁺⁺⁺⁺⁺⁺⁺⁺⁺│
       *      1⁺⁺░░░⁺⁺⁺⁺⁺1 ↑
       *      2⁺⁺░░▒░░░░⁺2 │
       *      3⁺⁺░a▒░b░░⁺3 │
       *      4⁺⁺░░▒░░░░⁺4 ╵
       *      5⁺⁺░░░⁺⁺⁺⁺⁺5 9
       *      │⁺⁺⁺⁺⁺⁺⁺⁺⁺⁺│ ╷
       *      7⁺⁺⁺⁺⁺⁺░░░⁺7 │
       *      8⁺⁺⁺⁺⁺⁺░c░⁺8 │
       *      9⁺⁺⁺⁺⁺⁺░░░⁺9 ↓
       *      └──2345678─┘
       * ```
       */
      const abc = [
        rect.fromCorners([pos(1, 2), pos(5, 4)]),
        rect.fromCorners([pos(2, 4), pos(4, 8)]),
        rect.fromCorners([pos(7, 6), pos(9, 8)]),
      ];

      const actual = rect.stack(abc);

      assert.deepEqual(actual, rect.fromCorners([pos(1, 2), pos(9, 8)]));
    });
  });

  suite('laws', () => {
    test('eq', () => laws.eq(rect.eq, rect.arb));
    test('monoid', () => laws.monoid(rect.monoid, rect.eq, rect.arb));
  });
});
