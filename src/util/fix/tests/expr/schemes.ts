import { identity, pipe } from 'fp-ts/lib/function';
import { Algebra, cata, zipAlgebras } from 'util/fix/kind1';
import { Unary } from 'util/function';
import { exprFunctor, matchExpr } from './ops';
import { Expr, URI } from './types';

type ExprAlgebra<A> = Algebra<URI, A>;

export const runAlgebra: ExprAlgebra<boolean> = matchExpr(
  identity,
  v => !v,
  (l, r) => l && r,
  (l, r) => l || r,
);

export const showAlgebra: ExprAlgebra<string> = matchExpr(
  v => (v ? '⊤' : '⊥'),
  e => `¬${e}`,
  (l, r) => `(${l} ∧ ${r})`,
  (l, r) => `(${l} ∨ ${r})`,
);

export const runExpr: Unary<Expr, boolean> = pipe(
  runAlgebra,
  cata(exprFunctor),
);

export const show: Unary<Expr, string> = pipe(showAlgebra, cata(exprFunctor));

const runAndShowAlgebra: ExprAlgebra<[boolean, string]> = zipAlgebras(
  exprFunctor,
)(runAlgebra, showAlgebra);

export const runAndShow: Unary<Expr, [boolean, string]> = pipe(
  runAndShowAlgebra,
  cata(exprFunctor),
);
