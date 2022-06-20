import { function as FN } from 'fp-ts';
import * as laws from 'fp-ts-laws';
import { assert, suite, test } from 'vitest';
import { cell, row } from 'src/grid';

suite('grid row instances', () => {
  test('show', () =>
    assert.equal(
      FN.pipe('a🙂', cell.parseRow, row.show.show),
      '[char: “a”, style=∅, wide: “🙂”:2, style=∅, cont #1]',
    ));

  suite('stack monoid', () => {
    const stack = FN.pipe('normal', row.stack, FN.untupled);

    test('wide below → above', () => {
      const [a, b] = [cell.parseRow('🙂'), [cell.plainNarrow('X'), cell.empty]];
      assert.deepEqual(stack(a, b), b);
    });

    test('wide above → below', () => {
      const [a, b] = [[cell.plainNarrow('X'), cell.empty], cell.parseRow('🙂')];
      assert.deepEqual(stack(a, b), b);
    });

    test('wide below + above → above', () => {
      const [a, b] = [cell.parseRow('😢'), cell.parseRow('🙂')];
      assert.deepEqual(stack(a, b), b);
    });

    test('glyph merge', () => {
      const [a, b] = [cell.parseRow('─'), cell.parseRow('│')];
      assert.deepEqual(stack(a, b), cell.parseRow('┼'));
    });

    suite('wide merges cannot be associative', () => {
      const [a, b, c] = [
        cell.parseRow('😢e'),
        cell.parseRow('d🙂'),
        [cell.empty, cell.plainNarrow('f'), cell.empty],
      ];
      const [left, right] = [stack(a, stack(b, c)), stack(stack(a, b), c)];

      test('left', () => assert.deepEqual(left, cell.parseRow('dfe')));
      test('right', () =>
        assert.deepEqual(right, [...cell.parseRow('df'), cell.empty]));
    });

    test('associative narrow', () => {
      const [a, b, c] = [
        [cell.plainNarrow(' '), cell.empty],
        [cell.plainNarrow(' '), cell.empty],
        [cell.plainNarrow(' '), cell.plainNarrow(' ')],
      ];
      const [left, right] = [stack(a, stack(b, c)), stack(stack(a, b), c)];
      assert.deepEqual(left, right);
    });

    suite('identity', () => {
      test('left', () =>
        assert.deepEqual(row.stack('over')([[cell.empty], [cell.empty]]), [
          cell.empty,
        ]));
    });
  });

  suite('laws', () => {
    test('eq', () => laws.eq(row.eq, row.getArb(4)));

    suite('monoid', () => {
      const narrowArb = row.getNarrowOrNoneArb(1);

      test('over', () => laws.monoid(row.monoid, row.eq, narrowArb));
      test('under', () => laws.monoid(row.underMonoid, row.eq, narrowArb));
    });
  });
});
