import { Pair } from 'util/tuple';
import { assert, suite, test } from 'vitest';
import { row, Row, cell } from 'src/grid';

suite('grid row zipWidth', () => {
  suite('narrow + wide', () => {
    const [fst, snd]: Pair<Row> = [
      cell.parseRow('a🙂b'),
      cell.parseRow('😢cd'),
    ];
    const [chunk1, chunk2] = row.zipWidth([fst, snd]);

    test('chunk1', () =>
      assert.deepEqual(chunk1, [cell.parseRow('a🙂'), cell.parseRow('😢c')]));

    test('chunk2', () =>
      assert.deepEqual(chunk2, [cell.parseRow('b'), cell.parseRow('d')]));
  });
});
