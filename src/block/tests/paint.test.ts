import { function as FN } from 'fp-ts';
import { align as AL, Align } from 'src/align';
import { assert, suite, test } from 'vitest';
import * as BU from '../build';
import * as PA from '../paint';
import * as TY from '../types';

suite('block paint', () => {
  const checkPaint =
    (height = 3) =>
    (expect: string[], align: Align) =>
      test(AL.show(align), () =>
        assert.deepEqual(
          FN.pipe(
            { rows: ['a', 'ab', 'abcd'], align, height },
            BU.build,
            PA.asStringsWith('.'),
          ),
          expect,
        ),
      );

  suite('hAlign', () => {
    const check = checkPaint();
    check(['a...', 'ab..', 'abcd'], TY.defaultAlign);
    check(['...a', '..ab', 'abcd'], AL.bottomRight);
    check(['.a..', '.ab.', 'abcd'], AL.topCenter);
  });

  suite('vAlign', () => {
    const check = checkPaint(5);
    check(['....', '....', 'a...', 'ab..', 'abcd'], TY.defaultAlign);
    check(['....', 'a...', 'ab..', 'abcd', '....'], AL.middleLeft);
    check(['.a..', '.ab.', 'abcd', '....', '....'], AL.topCenter);
    check(['....', '.a..', '.ab.', 'abcd', '....'], AL.middleCenter);
  });

  suite('shrink', () => {
    const check = checkPaint(1);

    check(['abcd'], TY.defaultAlign);
    check(['a...'], AL.topLeft);
    check(['.ab.'], AL.middleCenter);
  });

  suite('double width characters', () => {
    const iut = BU.fromRow('🙂');

    test('paint', () =>
      assert.deepEqual(FN.pipe(iut, PA.asStringsWith('.')), ['🙂']));
  });
});
