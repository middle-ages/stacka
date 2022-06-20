/** Some example expressions */

import { flow } from 'fp-ts/lib/function';
import { BinOp, Endo } from 'util/function';
import { Pair } from 'util/tuple';
import { and, not, or, value } from './ops';
import { Expr } from './types';

export type Op = BinOp<Expr>;

export const negate: Endo<Op> = op => flow(op, not);

/** `⊤/⊥` */
export const [trueValue, falseValue]: Pair<Expr> = [value(true), value(false)];

/** `p,q → ¬p ∧ ¬q` */
export const andNot: Op = (left, right) => and(not(left), not(right));

/** `p,q → ¬(p ∨ q)` */
export const nor: Op = negate(or);

/** `p,q → (p ⊻ q)` */
export const xor: Op = (left, right) =>
  and(or(left, right), not(and(left, right)));

/** `p,q → (p == q)` */
export const eq: Op = negate(xor);

/** `p,q → (¬p ∧ ¬q) == ¬(p ∨ q)` */
export const deMorgan: Op = (left, right) =>
  eq(andNot(left, right), nor(left, right));
