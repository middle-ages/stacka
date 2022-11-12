import { rgb } from 'ansis/colors';
import { function as FN } from 'fp-ts';
import { Size, size } from 'src/geometry';
import * as GR from 'src/grid';
import { head } from 'util/array';
import { Endo, Unary } from 'util/function';
import { assert, suite, test } from 'vitest';
import * as LE from '../lens';
import * as PA from '../paint';
import * as TY from '../types';
import { Backdrop } from '../types';

const withSquare = <R>(f: Unary<Size, R>): R => FN.pipe(1, size.square, f);

const printGrid = GR.paintWith('.');

suite('backdrop lens', () => {
  const blueOnRed = rgb(0, 0, 255).bgRgb(255, 0, 0);

  const iut: Backdrop = FN.pipe('A', blueOnRed, GR.parseRow, TY.center);

  const computeActual: Unary<Endo<Backdrop>, string[]> = f =>
    FN.pipe(iut, f, PA.paint, withSquare, printGrid);

  test('setFg', () => {
    const actual = FN.pipe(0xff_00_ff_ff, LE.setFg, computeActual, head);

    const expect = rgb(255, 255, 0).bgRgb(255, 0, 0)(`A`);

    assert.equal(actual, expect);
  });

  test('setRune', () =>
    assert.deepEqual(
      FN.pipe('B', LE.setRune, computeActual, head),
      blueOnRed('B'),
    ));
});
