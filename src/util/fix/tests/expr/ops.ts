import { flow } from 'fp-ts/lib/function';
import { Functor1 } from 'fp-ts/lib/Functor';
import { Binary, BinOp, Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { And, Expr, ExprF, fixExpr, Not, Or, URI, Value } from './types';

export const [value, not]: [Unary<boolean, Expr>, Endo<Expr>] = [
  flow(Value.of, fixExpr),
  flow(Not.of, fixExpr),
];

export const [and, or]: Pair<BinOp<Expr>> = [
  (left, right) => fixExpr(new And(left, right)),
  (left, right) => fixExpr(new Or(left, right)),
];

export const [isAnd, isOr] = [
  <A>(expr: ExprF<A>): expr is And<A> => '_tag' in expr && expr._tag === 'And',
  <A>(expr: ExprF<A>): expr is Or<A> => '_tag' in expr && expr._tag === 'Or',
];

export const exprFunctor: Functor1<URI> = {
  URI,
  map: <A, B>(fa: ExprF<A>, f: Unary<A, B>): ExprF<B> => fa.map(f),
};

export const matchExpr =
  <T, A>(
    onValue: Unary<boolean, T>,
    onNot: Unary<A, T>,
    onAnd: Binary<A, A, T>,
    onOr: Binary<A, A, T>,
  ): Unary<ExprF<A>, T> =>
  expr => {
    return expr instanceof Value
      ? onValue(expr.value)
      : expr instanceof Not
      ? onNot(expr.expr)
      : isAnd(expr)
      ? onAnd(expr.left, expr.right)
      : isOr(expr)
      ? onOr(expr.left, expr.right)
      : (() => {
          throw new Error('Invalid or missing tag');
        })();
  };
