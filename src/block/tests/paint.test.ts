import { function as FN, option as OP } from 'fp-ts';
import { Align, align, showAlign } from 'src/align';
import { block, defaultAlign } from 'src/block';
import { assertDeepEqual } from 'util/chai';
import { leftTupleWith } from 'util/tuple';
import { suite, test } from 'vitest';

suite('block paint', () => {
  const checkPaint =
    (h = 3) =>
    (expect: string[], a?: Align) =>
      test(showAlign.show(a ?? defaultAlign), () =>
        FN.pipe(
          ['a', 'ab', 'abcd'],
          block.aligned,
          a === undefined ? FN.identity : block.align.set(a),
          block.height.set(h),
          FN.pipe('.', OP.some, block.fillChar.set),
          block.paint,
          leftTupleWith(expect),
          assertDeepEqual,
        ),
      );

  suite('hAlign', () => {
    const check = checkPaint();
    check(['a...', 'ab..', 'abcd']);
    check(['...a', '..ab', 'abcd'], align.bottomRight);
    check(['.a..', '.ab.', 'abcd'], align.topCenter);
  });

  suite('vAlign', () => {
    const check = checkPaint(5);
    check(['....', '....', 'a...', 'ab..', 'abcd']);
    check(['....', 'a...', 'ab..', 'abcd', '....'], align.middleLeft);
    check(['.a..', '.ab.', 'abcd', '....', '....'], align.topCenter);
    check(['....', '.a..', '.ab.', 'abcd', '....'], align.middleCenter);
  });

  suite('shrink', () => {
    const check = checkPaint(1);

    check(['abcd']);
    check(['a...'], align.topLeft);
    check(['.ab.'], align.middleCenter);
  });
});
