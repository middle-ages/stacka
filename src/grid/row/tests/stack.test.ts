import { array as AR, function as FN } from 'fp-ts';
import { assert, suite, test } from 'vitest';
import { cell, Row, row } from 'src/grid';
import { bitmap } from 'src/bitmap';
import { Pair } from 'util/tuple';
import { BlendMode } from 'src/color';
import { typedEntries } from 'util/object';
import { glyph } from 'src/glyph';

suite('grid row stack', () => {
  const parse = cell.parseRow;

  const {
      line: { horizontal, vertical },
      cross,
    } = bitmap,
    space = glyph.space.char,
    [lowerRow, capsRow, hLineRow, vLineRow, crossRow, spaceRow]: Row[] =
      FN.pipe(
        [
          'ab',
          'AB',
          horizontal + horizontal,
          vertical + vertical,
          cross + cross,
          space + space,
        ],
        AR.map(parse),
      ),
    noneRow = row.emptyN(2),
    wideRow = parse('🙂');

  const testStackOf =
    (...rows: Pair<Row>) =>
    (blend: BlendMode, expect: Row) =>
      test(blend, () =>
        assert.deepEqual(FN.pipe(rows, row.stack(blend)), expect),
      );

  const testStacks =
    (name: string, ...input: Pair<Row>) =>
    (tests: Record<'over' | 'under' | 'normal', Row>) =>
      suite(name, () => {
        const testStack = testStackOf(...input);
        for (const [blend, expect] of typedEntries(tests))
          testStack(blend, expect);
      });

  testStacks(
    'letters',
    lowerRow,
    capsRow,
  )({ over: capsRow, under: lowerRow, normal: capsRow });

  testStacks(
    'lines',
    hLineRow,
    vLineRow,
  )({ over: vLineRow, under: hLineRow, normal: crossRow });

  testStacks(
    'empty',
    lowerRow,
    [],
  )({ over: lowerRow, under: lowerRow, normal: lowerRow });

  testStacks(
    'none cells',
    noneRow,
    lowerRow,
  )({
    over: lowerRow,
    under: lowerRow,
    normal: lowerRow,
  });

  testStacks(
    'space cells',
    lowerRow,
    spaceRow,
  )({ over: spaceRow, under: lowerRow, normal: lowerRow });

  suite('wide', () => {
    suite('above', () => {
      testStacks(
        'empty',
        [],
        wideRow,
      )({ over: wideRow, under: wideRow, normal: wideRow });

      testStacks(
        'none',
        noneRow,
        wideRow,
      )({ over: wideRow, under: wideRow, normal: wideRow });

      testStacks(
        'space cells',
        spaceRow,
        wideRow,
      )({ over: wideRow, under: spaceRow, normal: wideRow });
    });

    suite('below', () => {
      testStacks(
        'empty',
        wideRow,
        [],
      )({ over: wideRow, under: wideRow, normal: wideRow });

      testStacks(
        'none',
        wideRow,
        noneRow,
      )({ over: wideRow, under: wideRow, normal: wideRow });

      testStacks(
        'space cells',
        wideRow,
        spaceRow,
      )({ over: spaceRow, under: wideRow, normal: wideRow });
    });

    testStacks(
      'wide over narrow',
      lowerRow,
      wideRow,
    )({ over: wideRow, under: lowerRow, normal: wideRow });

    testStacks(
      'narrow over wide',
      wideRow,
      lowerRow,
    )({ over: lowerRow, under: wideRow, normal: lowerRow });
  });

  suite('wide+narrow', () => {
    const xRow = parse('X'),
      expect = [...xRow, ...wideRow];

    testStacks(
      'wide above narrow',
      [...xRow, ...row.emptyN(2)],
      [...row.emptyN(1), ...wideRow],
    )({ over: expect, under: expect, normal: expect });

    testStacks(
      'narrow above wide',
      [...row.emptyN(1), ...wideRow],
      [...xRow, ...row.emptyN(2)],
    )({ over: expect, under: expect, normal: expect });
  });
});
