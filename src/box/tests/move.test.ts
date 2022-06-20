import { function as FN } from 'fp-ts';
import { AlignPair, OrientPair } from 'src/align';
import { Box, box } from 'src/box';
import { pos } from 'src/geometry';
import { Pair } from 'util/tuple';
import { assert, suite, test } from 'vitest';

const boxes: Pair<Box> = [box.fromRows(['AB', 'CD']), box.fromRow('XYZ')];

suite('box move', () => {
  /**
   *  anchor     placed
   *
   * ┌─01───┐   ┌─012──┐
   * │ ┊    │   │ ┊    │
   * 0┈AB░░┈┤   0┈XYZ░┈┤
   * 1 CD░░ │   │ ░░░░ │
   * │ ░░░░ │   │ ░░░░ │
   * │ ┊    │   │ ┊    │
   * └─┴────┘   └─┴────┘
   */

  suite('move', () => {
    const testMove = (iut: OrientPair, expect: Pair<number>, gap = 0) =>
      test(iut.join('-'), () =>
        assert.deepEqual(
          FN.pipe(boxes, box.moveGap(iut)(gap), box.pos.get),
          pos.tupled(expect),
        ),
      );

    suite('gap=0', () => {
      testMove(
        /**
         * ```txt
         * ┌─01234──┐
         * │ ┊      │
         * 0┈ABXYZ░┈┤
         * 1 CD▓▓▓░ │
         * │ ░░░░░░ │
         * │ ┊      │
         * └─┴──────┘
         * ```
         */
        ['right', 'left'],
        [0, 2],
      );
      testMove(
        /**
         * ```txt
         *   --- +
         * ┌─32101──┐
         * │    ┊   │
         * 0┈XYZAB░┈┤
         * 1 ▓▓▓CD░ │
         * │ ░░░░░░ │
         * │    ┊   │
         * └────┴───┘
         * ```
         */
        ['left', 'right'],
        [0, -3],
      );
      testMove(
        /**
         * ```txt
         * ┌─012──┐
         * │ ┊    │
         * 0┈AB▓░┈┤
         * 1 CD▓░ │
         * 2 XYZ░ │
         * │ ░░░░ │
         * │ ┊    │
         * └─┴────┘
         * ```
         */
        ['bottom', 'top'],
        [2, 0],
      );
      testMove(
        /**
         * ```txt
         *  ┌─012──┐
         *  │ ┊    │
         * -1┈XYZ░┈┤
         *  0 AB▓░ │
         * +1 CD▓░ │
         * +2 ░░░░ │
         *  │ ┊    │
         *  └─┴────┘
         * ```
         */
        ['top', 'bottom'],
        [-1, 0],
      );
    });

    suite('gap=1', () => {
      testMove(
        /**
         * ```txt
         * ┌─012345──┐
         * │ ┊       │
         * 0┈AB▓XYZ░┈┤
         * 1 CD▓▓▓▓░ │
         * │ ░░░░░░░ │
         * │ ┊       │
         * └─┴───────┘
         * ```
         */
        ['right', 'left'],
        [0, 3],
        1,
      );
      testMove(
        /**
         * ```txt
         *    ---- +
         *  ┌─432101──┐
         *  │     ┊   │
         *  0┈XYZ▓AB░┈┤
         *  1 ▓▓▓▓CD░ │
         *  │ ░░░░░░░ │
         *  │     ┊   │
         *  └─────┴───┘
         * ```
         */
        ['left', 'right'],
        [0, -4],
        1,
      );
      testMove(
        /**
         * ```txt
         *  ┌─012──┐
         *  │ ┊    │
         *  0┈AB▓░┈┤
         *  1 CD▓░ │
         *  2 ▓▓▓░ │
         *  3 XYZ░ │
         *  │ ░░░░ │
         *  │ ┊    │
         *  └─┴────┘
         * ```
         */
        ['bottom', 'top'],
        [3, 0],
        1,
      );
      testMove(
        /**
         * ```txt
         *  ┌─012──┐
         *  │ ┊    │
         * -2┈XYZ░┈┤
         * -1 ▓▓▓░ │
         *  0 AB▓░ │
         * +1 CD▓░ │
         * +2 ░░░░ │
         *  │ ┊    │
         *  └─┴────┘
         * ```
         */
        ['top', 'bottom'],
        [-2, 0],
        1,
      );
    });
  });

  suite('moveAlignGap', () => {
    const testMoveAlignGap = (iut: AlignPair, expect: Pair<number>, gap = 0) =>
      test(iut.join('-'), () =>
        assert.deepEqual(
          FN.pipe(boxes, box.moveAlignGap(gap)(iut), box.pos.get),
          pos.tupled(expect),
        ),
      );

    suite('gap=0', () => {
      testMoveAlignGap(
        /**
         * ```txt
         * ┌─01234──┐
         * │ ┊      │
         * 0┈AB▓▓▓░┈┤
         * 1 CDXYZ░ │
         * │ ░░░░░░ │
         * │ ┊      │
         * └─┴──────┘
         * ```
         */
        ['right', 'bottom'],
        [1, 2],
      );
      testMoveAlignGap(
        /**
         * ```txt
         * ┌─01234──┐
         * │ ┊      │
         * 0┈ABXYZ░┈┤
         * 1 CD▓▓▓░ │
         * │ ░░░░░░ │
         * │ ┊      │
         * └─┴──────┘
         * ```
         */
        ['right', 'top'],
        [0, 2],
      );
      testMoveAlignGap(
        /**
         * ```txt
         * ┌─32101──┐
         * │ ┊      │
         * 0┈▓▓▓AB░┈┤
         * 1 XYZCD░ │
         * │ ░░░░░░ │
         * │ ┊      │
         * └─┴──────┘
         * ```
         */
        ['left', 'bottom'],
        [1, -3],
      );
    });
  });
});
