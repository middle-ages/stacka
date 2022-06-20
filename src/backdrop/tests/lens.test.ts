import { rgb } from 'ansis/colors';
import { function as FN } from 'fp-ts';
import { Backdrop, backdrop } from 'src/backdrop';
import { hex } from 'src/color';
import { Size, size } from 'src/geometry';
import { grid } from 'src/grid';
import { head } from 'util/array';
import { Endo, Unary } from 'util/function';
import { assert, suite, test } from 'vitest';

const withSquare = <R>(f: Unary<Size, R>): R => FN.pipe(1, size.square, f);

const printGrid = grid.asStringsWith('.');

suite('backdrop lens', () => {
  const blueOnRed = rgb(0, 0, 255).bgRgb(255, 0, 0);

  const iut: Backdrop = FN.pipe('A', blueOnRed, grid.parseRow, backdrop.center);

  const computeActual: Unary<Endo<Backdrop>, string[]> = f =>
    FN.pipe(iut, f, backdrop.paint, withSquare, printGrid);

  test('setGridFg', () => {
    const actual = FN.pipe(
      hex(`#ffff00ff`),
      backdrop.setGridFg,
      computeActual,
      head,
    );

    const expect = rgb(255, 255, 0).bgRgb(255, 0, 0)(`A`);

    assert.equal(actual, expect);
  });

  test('setGridChar', () =>
    assert.deepEqual(
      FN.pipe('B', backdrop.setGridChar, computeActual, head),
      blueOnRed('B'),
    ));
});
