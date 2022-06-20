import { function as FN } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { cell, Cell, style } from 'src/grid';
import { Pair } from 'util/tuple';
import { assert, suite, test } from 'vitest';

suite('grid cell ops', () => {
  const [narrowˣ2, wideˣ2]: Pair<Cell[]> = FN.pipe(
    ['ab', '🙂😢'],
    mapBoth(cell.parseRow),
  );

  suite('chopCharLeft', () => {
    test('“narrow” head', () => {
      const [head, ...tail] = narrowˣ2;
      assert.deepEqual(cell.chopCharLeft([head, ...tail]), [[head], tail]);
    });

    test('“wide” head', () => {
      const [head, ...tail] = wideˣ2,
        [headCont, sndWide, sndCont] = tail;
      assert.deepEqual(cell.chopCharLeft([head, ...tail]), [
        [head, headCont],
        [sndWide, sndCont],
      ]);
    });

    suite('one “wide”', () => {
      const [head, ...tail] = cell.parseRow('🙂'),
        [resHead, resTail] = cell.chopCharLeft([head, ...tail]);

      test('head', () => assert.deepEqual(resHead, [head, ...tail]));
      test('resTail', () => assert.deepEqual(resTail, []));
    });
  });

  suite('chopCharRight', () => {
    test('“narrow” last', () => {
      const [head, ...tail] = narrowˣ2,
        last = tail[0];

      assert.deepEqual(cell.chopCharRight([head, ...tail]), [[last], [head]]);
    });

    suite('“wide” last', () => {
      const [head, ...tail] = wideˣ2,
        [headCont, lastWide, lastCont] = tail,
        [resLast, resInit] = cell.chopCharRight([head, ...tail]);

      test('last', () => assert.deepEqual(resLast, [lastWide, lastCont]));
      test('init', () => assert.deepEqual(resInit, [head, headCont]));
    });

    suite('one “wide”', () => {
      const [head, ...tail] = cell.parseRow('🙂'),
        [resLast, resInit] = cell.chopCharRight([head, ...tail]);

      test('last', () => assert.deepEqual(resLast, [head, tail[0]]));
      test('init', () => assert.deepEqual(resInit, []));
    });

    test('chunkChars', () => {
      const cells = [...cell.parseRow('a🙂c'), cell.empty];
      assert.deepEqual(cell.chunkChars(cells), [
        [cell.plainNarrow('a')],
        FN.pipe('🙂', cell.wide(style.empty)),
        [cell.plainNarrow('c')],
        [cell.empty],
      ]);
    });
  });
});
