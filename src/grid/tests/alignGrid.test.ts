import { function as FN } from 'fp-ts';
import { withSnd } from 'fp-ts-std/Tuple';
import { align as AL, HAlign, mapVAlign, VAlign } from 'src/align';
import { Effect } from 'util/function';
import { suite } from 'vitest';
import { alignGrid } from '../alignGrid';
import * as PA from '../parse';
import { testPaint } from './helpers';

suite('grid Align', () => {
  const testAlign =
    (actual: string[], width: number, height: number) =>
    ([horizontal, expect]: [HAlign, string[]]): Effect<VAlign> =>
    vertical => {
      const align = { horizontal, vertical };
      testPaint(
        AL.show(align),
        FN.pipe(
          PA.parseRows('center', actual),
          alignGrid(align, { width, height }),
        ),
        expect,
      );
    };

  suite('one row ⇒ one row', () => {
    type Case = [HAlign, string];
    const check =
      (actual: string, width: number, height: number) =>
      (...cases: Case[]) => {
        const check = ([hAlign, expect]: Case) =>
          testAlign([actual], width, height)([hAlign, [expect]]);

        cases.forEach(FN.flow(check, mapVAlign));
      };

    suite('2x1 ⇒ 2x1 ↔0 ↕0', () =>
      check('ab', 2, 1)(...AL.mapHAlign(withSnd('ab'))),
    );

    suite('1x1 ⇒ 3x1 ↔+ ↕0', () =>
      check('x', 3, 1)(['left', 'x..'], ['center', '.x.'], ['right', '..x']),
    );

    suite('3x1 ⇒ 4x1 ↔+ ↕0', () =>
      check('abc', 4, 1)(
        ['left', 'abc.'],
        ['center', 'abc.'],
        ['right', '.abc'],
      ),
    );

    suite('4x1 ⇒ 2x1 ↔- ↕0', () =>
      check('abcd', 2, 1)(['left', 'ab'], ['center', 'bc'], ['right', 'cd']),
    );
  });

  suite('two rows ⇒ two rows', () => {
    const makeCheck =
      (source: string[]) =>
      (horizontal: HAlign, width: number, expect: string[]) => {
        suite(`width: ${width}`, () => {
          AL.mapVAlign(vertical => {
            const align = { horizontal, vertical };
            testPaint(
              AL.show(align),
              alignGrid(align, { width, height: 2 })(
                PA.parseRows(align.horizontal, source),
              ),
              expect,
            );
          });
        });
      };

    suite('1x2', () => {
      const check = makeCheck(['a', 'b']);

      suite('⇒ 1x2 ↔0 ↕0', () => {
        check('left', 1, ['a', 'b']);
        check('center', 1, ['a', 'b']);
        check('right', 1, ['a', 'b']);
      });

      suite('⇒ 2x2 ↔+ ↕0', () => {
        check('left', 2, ['a.', 'b.']);
        check('center', 2, ['a.', 'b.']);
        check('right', 2, ['.a', '.b']);
      });
    });

    suite('5x2', () => {
      const check = makeCheck(['abcde', 'xy']);

      suite('⇒ 2x2 ↔- ↕0', () => {
        check('left', 2, ['ab', 'xy']);
        check('center', 2, ['cd', 'xy']);
        check('right', 2, ['de', 'xy']);
      });
    });
  });
});
