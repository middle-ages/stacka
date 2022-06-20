import { function as FN } from 'fp-ts';
import { flip, uncurry2 } from 'fp-ts-std/Function';
import { box, Box } from 'src/box';
import { Pair } from 'util/tuple';
import { suite } from 'vitest';
import { testPaint } from '../../tests/helpers';

/**
 * ```txt
 *  anchor     placed
 *
 * ┌─01───┐   ┌─012──┐
 * │ ┊    │   │ ┊    │
 * 0┈AB░░┈┤   0┈XYZ░┈┤
 * 1 CD░░ │   │ ░░░░ │
 * │ ░░░░ │   │ ░░░░ │
 * │ ┊    │   │ ┊    │
 * └─┴────┘   └─┴────┘
 * ```
 */
const boxes: Pair<Box> = [box.fromRows(['AB', 'CD']), box.fromRow('XYZ')];

suite('box place', () => {
  suite('place', () => {
    const place = FN.flow(FN.untupled(flip(box.place)(0)), uncurry2);

    suite('gap=0', () => {
      testPaint('right-top', FN.pipe(boxes, place('right', 'top')), [
        'ABXYZ', //
        'CD...',
      ]);

      testPaint('right-bottom', FN.pipe(boxes, place('right', 'bottom')), [
        'AB...', //
        'CDXYZ',
      ]);

      testPaint('left-top', FN.pipe(boxes, place('left', 'top')), [
        'XYZAB', //
        '...CD',
      ]);

      testPaint('left-bottom', FN.pipe(boxes, place('left', 'bottom')), [
        '...AB', //
        'XYZCD',
      ]);

      testPaint('top-left', FN.pipe(boxes, place('top', 'left')), [
        'XYZ', //
        'AB.',
        'CD.',
      ]);

      testPaint('top-right', FN.pipe(boxes, place('top', 'right')), [
        'XYZ', //
        '.AB',
        '.CD',
      ]);

      testPaint('bottom-left', FN.pipe(boxes, place('bottom', 'left')), [
        'AB.', //
        'CD.',
        'XYZ',
      ]);

      testPaint('bottom-right', FN.pipe(boxes, place('bottom', 'right')), [
        '.AB', //
        '.CD',
        'XYZ',
      ]);
    });
  });
});
