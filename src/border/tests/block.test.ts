import { function as FN, option as OP, tuple as TU } from 'fp-ts';
import {
  getDirParts,
  line,
  Mat,
  mergeColumns,
  mergeRows,
  unsetBorderEdge,
} from 'src/border';
import { stackMatrices } from 'src/border/char/stack';
import { callWith } from 'util/function';
import { tuple3Map } from 'util/tuple';
import { assert, suite, test } from 'vitest';
import { blockOf } from 'src/block';
import { paintRect } from 'src/canvas';
import { pairVAlign } from 'src/align';
import { onlyLeft, lineLeft, Border, paintBorder } from 'src/border';
import { unstyleLines } from '../../util/char';

suite('border', () => {
  const block = blockOf(paintRect);

  const bordered = FN.pipe(
    ['x', 'zzz'],
    FN.pipe(['top', 'center'], pairVAlign, block.atOrigin),
  );

  const render = (b: Border): string[] =>
    FN.pipe(paintBorder(b)(block.paint(bordered)), unstyleLines);

  test('line', () =>
    assert.deepEqual(render(line), ['┌───┐', '│ x │', '│zzz│', '└───┘']));

  test('onlyLeft', () => assert.deepEqual(render(onlyLeft), ['│ x ', '│zzz']));

  test('lineLeft', () =>
    assert.deepEqual(render(lineLeft), ['┌   ', '│ x ', '│zzz', '└   ']));

  test('stackMatrices', () => {
    const fst: Mat = ['..#..', '..#..', '#####', '.....', '.....'],
      snd: Mat = ['#....', '#....', '..###', '.....', '.....'],
      expect: Mat = ['#.#..', '#.#..', '#####', '.....', '.....'];

    assert.deepEqual(stackMatrices([fst, snd]), expect);
  });

  test('mergeRows', () => assert.equal(mergeRows(['└───┘', '┌───┐']), '├───┤'));

  test('mergeColumns', () =>
    assert.deepEqual(
      mergeColumns(['┐', '┼', '│', '┤', '┘'], ['┌', '┼', '│', '├', '└']),
      ['┬', '┼', '│', '┼', '┴'],
    ));

  suite('edges', () => {
    test('getEdge', () => {
      const iut = FN.pipe('right', getDirParts(line), tuple3Map(TU.fst));
      assert.deepEqual(iut, [OP.some('┐'), OP.some('│'), OP.some('┘')]);
    });
    test('unsetEdge', () => {
      const iut = FN.pipe(
        'bottom',
        callWith(FN.flow(unsetBorderEdge(line), getDirParts)),
        tuple3Map(TU.fst),
      );
      assert.deepEqual(iut, [OP.none, OP.none, OP.none]);
    });
  });
});
