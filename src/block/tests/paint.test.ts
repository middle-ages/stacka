import { function as FN } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import { withSnd } from 'fp-ts-std/Tuple';
import { Align, align } from 'src/align';
import { block } from 'src/block';
import { grid as GR } from 'src/grid';
import { assertDeepEqual } from 'util/chai';
import { assert, suite, test } from 'vitest';

suite('block paint', () => {
  const checkPaint =
    (h = 3) =>
    (expect: string[], a: Align) =>
      test(align.show(a), () =>
        FN.pipe(
          ['a', 'ab', 'abcd'],
          block.fromRows,
          block.align.set(a),
          block.height.set(h),
          block.asStringsWith('.'),
          withSnd(expect),
          assertDeepEqual,
        ),
      );

  suite('hAlign', () => {
    const check = checkPaint();
    check(['a...', 'ab..', 'abcd'], block.defaultAlign);
    check(['...a', '..ab', 'abcd'], align.bottomRight);
    check(['.a..', '.ab.', 'abcd'], align.topCenter);
  });

  suite('vAlign', () => {
    const check = checkPaint(5);
    check(['....', '....', 'a...', 'ab..', 'abcd'], block.defaultAlign);
    check(['....', 'a...', 'ab..', 'abcd', '....'], align.middleLeft);
    check(['.a..', '.ab.', 'abcd', '....', '....'], align.topCenter);
    check(['....', '.a..', '.ab.', 'abcd', '....'], align.middleCenter);
  });

  suite('shrink', () => {
    const check = checkPaint(1);

    check(['abcd'], block.defaultAlign);
    check(['a...'], align.topLeft);
    check(['.ab.'], align.middleCenter);
  });

  suite('double width characters', () => {
    const iut = block.fromRow('🙂'),
      [grid, size] = FN.pipe(iut, fork([block.grid.get, block.size.get]));

    test('size', () => assert.deepEqual(FN.pipe(iut, block.width.get), 2));

    test('align', () => {
      const aligned = FN.pipe(
        grid,
        FN.pipe(size, GR.align(align.bottomLeft)),
        GR.asString,
      );
      assert.deepEqual(aligned, '🙂');
    });

    test('paint', () =>
      assert.deepEqual(FN.pipe(iut, block.asStringsWith('.')), ['🙂']));
  });
});
