import { Pair } from 'util/tuple';
import { assert, suite, test } from 'vitest';
import { row, Row, cell } from 'src/grid';

const apply = row.chopMinLeft;

suite('grid row chopMinLeft', () => {
  suite('narrow + wide', () => {
    const [fst, snd]: Pair<Row> = [
      cell.parseRow('a🙂b'),
      cell.parseRow('😢cd'),
    ];
    const [[fstDone, fstTodo], [sndDone, sndTodo]] = apply([fst, snd]);

    test('fst done', () => assert.deepEqual(fstDone, cell.parseRow('a🙂')));
    test('fst todo', () => assert.deepEqual(fstTodo, cell.parseRow('b')));

    test('snd done', () => assert.deepEqual(sndDone, cell.parseRow('😢c')));
    test('snd todo', () => assert.deepEqual(sndTodo, cell.parseRow('d')));
  });

  suite('only one chunk', () => {
    const [fst, snd]: Pair<Row> = [
      cell.parseRow('a🙂🙂🙂'),
      cell.parseRow('😢😢😢b'),
    ];
    const [[fstDone, fstTodo], [sndDone, sndTodo]] = apply([fst, snd]);

    test('fst done', () => assert.deepEqual(fstDone, fst));
    test('fst todo', () => assert.deepEqual(fstTodo, []));

    test('snd done', () => assert.deepEqual(sndDone, snd));
    test('snd todo', () => assert.deepEqual(sndTodo, []));
  });
});
