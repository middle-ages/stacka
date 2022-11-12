import { function as FN } from 'fp-ts';
import { align as AL, Align, HAlign } from 'src/align';
import { BlendMode } from 'src/color';
import { rect } from 'src/geometry';
import { Grid } from 'src/grid';
import { Binary } from 'util/function';
import { suite } from 'vitest';
import { expand } from '../expand';
import { show } from '../instances';
import { parseRows } from '../parse';
import * as IUT from '../stack';
import * as TY from '../types';
import { narrowRed1x1, paint, testPaint } from './helpers';

type RawGrid = Grid | string[];
type MakeGrid = (lower: Grid, hAlign: HAlign) => Grid;

const normalize: Binary<HAlign, RawGrid, Grid> = (hAlign, raw) =>
  Array.isArray(raw) ? parseRows(hAlign, raw) : (raw as Grid);

const testLowerStack =
  (mode: BlendMode) =>
  ([rawLower, makeUpper]: [RawGrid, MakeGrid]) =>
  (hAlign: HAlign) => {
    const align = AL.vhAlign('bottom')(hAlign),
      lower = normalize(hAlign, rawLower),
      upper = makeUpper(lower, hAlign);

    testPaint(
      [AL.show(align), show.show(lower), show.show(upper)].join(', '),
      FN.pipe(
        [lower, upper],
        FN.pipe(mode, IUT.stackAlign([align, TY.size(lower)])),
      ),
      paint(lower),
    );
  };

// run testLowerStack for blends `normal`,`under` + all horizontal alignments
const testAlignStack =
  (makeUpper: MakeGrid) => (name: string, lower: RawGrid) =>
    suite(`${name}: ∀ blendMode ∈ [“normal”, “under”]: stacked==lower`, () => {
      (['normal', 'under'] as BlendMode[]).map(mode =>
        suite([`mode=${mode}`, `∀ hAlign ∈ HAlign`].join(', '), () => {
          FN.pipe([lower, makeUpper], testLowerStack(mode), AL.mapHAlign);
        }),
      );
    });

suite('grid stackAlign', () => {
  suite('basic', () => {
    testPaint(
      '2 narrows below wide',
      IUT.stack('normal')([
        parseRows('left', ['AB']),
        parseRows('left', ['🙂']),
      ]),
      ['🙂'],
    );

    testPaint(
      '1 narrow below wide',
      IUT.stack('normal')([
        parseRows('left', ['A']),
        parseRows('left', ['🙂']),
      ]),
      ['🙂'],
    );

    testPaint(
      '1 narrow below wide, right aligned',
      IUT.stack('normal')([
        parseRows('right', ['A']),
        parseRows('right', ['🙂']),
      ]),
      ['🙂'],
    );

    testPaint(
      'wide between narrow',
      IUT.stack('normal')([
        parseRows('center', ['A  B']),
        expand({ top: 0, right: 1, bottom: 0, left: 1 })(
          parseRows('center', ['🙂']),
        ),
      ]),
      ['A🙂B'],
    );
  });

  const runTests = (name: string, f: Binary<string, RawGrid, void>) => {
    suite(`upper=${name}, size=lower.size`, () => {
      f('empty', TY.empty());
      f('1x1', narrowRed1x1);
      f('jagged', ['a', 'abc']);
      f('wide', ['🙂']);
    });
  };

  runTests(
    'empty',
    testAlignStack(() => TY.empty()),
  );

  runTests(
    'lower.size of “none” cells',
    testAlignStack(lower => FN.pipe(lower, TY.size, TY.sized)),
  );

  suite('stackChildren lower=5x3', () => {
    //
    // ```txt
    // lower
    //
    // ┌12345┐
    // 1X
    // 2A   B
    // 312345
    // └
    // ```
    //
    const lower = parseRows('left', ['X    ', 'A   B', '12345']),
      stackSize = TY.size(lower);

    const testStack =
      (upper: string[]) =>
      (top: number, left: number) =>
      (align: Align, expect: string[]) => {
        const upperGrid = parseRows('left', upper);

        const stacked = FN.pipe(
          [[upperGrid, rect({ top, left }, stackSize)]],
          FN.pipe(lower, IUT.stackChildren(align, stackSize, 'combineOver')),
        );

        testPaint(AL.show(align), stacked, expect);
      };

    //
    // ```txt
    // upper
    //
    // ┌123┐
    // 1αβγ
    // └
    // ```
    //
    suite('upper=123', () => {
      const test123 = testStack(['αβγ']);

      suite('top=0, left=0', () => {
        const test0x0 = test123(0, 0);

        test0x0(AL.topLeft, ['αβγ..', 'A...B', '12345']);
        test0x0(AL.middleCenter, ['X....', 'AαβγB', '12345']);
        test0x0(AL.bottomRight, ['X....', 'A...B', '12αβγ']);
      });

      suite('top=1, left=2', () => {
        const test1x2 = test123(1, 2);

        test1x2(AL.topLeft, ['X....', 'A.αβγ', '12345']);
        test1x2(AL.middleCenter, ['X....', 'A.αβγ', '12345']);
        test1x2(AL.bottomRight, ['X....', 'A...B', '12αβγ']);
      });
    });

    //
    // ```txt
    // upper
    //
    // ┌12┐
    // 1🙂
    // └
    // ```
    //
    suite('upper=🙂', () => {
      const test123 = testStack(['🙂']);

      suite('top=0, left=0', () => {
        const test0x0 = test123(0, 0);

        test0x0(AL.topLeft, ['🙂...', 'A...B', '12345']);
      });
    });
  });
});
