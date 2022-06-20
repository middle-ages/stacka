import { function as FN, tuple as TU } from 'fp-ts';
import { Endo, Unary } from 'util/function';
import { Matrix, RelCheck } from '../data';
import * as IN from './instances';
import * as matrix from './matrix';

const matEq = FN.tupled(IN.matrixEq.equals),
  fromOp: Unary<Endo<Matrix>, RelCheck> = f => FN.flow(TU.mapSnd(f), matEq);

/** When first is inverted, it is equal to the second */
export const invertEq: RelCheck = fromOp(matrix.invert);

/** When first is flipped on vertical axis, it is equal to the second */
export const hFlipEq: RelCheck = fromOp(matrix.hFlip);

/** When first is flipped on horizontal axis, it is equal to the second */
export const vFlipEq: RelCheck = fromOp(matrix.vFlip);

/** When first is turned 90ᵒ clockwise, it is equal to the second */
export const turnEq: RelCheck = fromOp(matrix.turn);
