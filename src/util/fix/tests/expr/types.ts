/**
 * A boolean expression higher-kinded type for testing fix/Kind₁
 */

import { HKT, Kind } from 'fp-ts/lib/HKT';
import { fix, Fix, unfix } from 'util/fix/kind1';
import { Unary } from 'util/function';
import { Trampoline } from 'util/trampoline/types';

export const URI = 'Expr';
export type URI = typeof URI;

// ExprF<A> ≃ Kind<URI, A>
declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: ExprF<A>;
  }
}

// Fix<URI> ≃ Kind<URI, Fix<URI>> ≃ ExprF<Fix<URI>>
export type Expr = Fix<URI>;
export type ExprKind<A> = Kind<URI, A>;
export type ExprHkt = ExprKind<Expr>;

export type ExprF<A> = Value<A> | Not<A> | And<A> | Or<A>;
export type ExprMap<A> = <B>(f: Unary<A, B>) => ExprF<B>;

export const [fixExpr, unfixExpr]: [
  Unary<ExprHkt, Expr>,
  Unary<Expr, ExprHkt>,
] = [fix, unfix];

export class Value<A> implements HKT<URI, A> {
  readonly _URI!: URI;
  readonly _A!: A;
  constructor(readonly value: boolean) {}
  map: ExprMap<A> = () => this as any;
  static of = <A>(value: boolean): Value<A> => new Value(value);
}

export class Not<A> implements HKT<URI, A> {
  readonly _URI!: URI;
  readonly _A!: A;
  constructor(readonly expr: A) {}
  map: ExprMap<A> = f => new Not(f(this.expr));
  //   <A, B>(ta: Kind<T, A>, f: (a: A) => EF.Effect<R, E, B>): EF.Effect<R, E, Kind<T, B>>;
  mapT = <B>(f: Unary<A, Trampoline<B>>) => new Not(f(this.expr));
  static of = <A>(expr: A): Not<A> => new Not(expr);
}

export class And<A> implements HKT<URI, A> {
  readonly _tag: 'And' = 'And';
  readonly _URI!: URI;
  readonly _A!: A;
  constructor(readonly left: A, readonly right: A) {}
  map: ExprMap<A> = f => new And(f(this.left), f(this.right));
}

export class Or<A> implements HKT<URI, A> {
  readonly _tag: 'Or' = 'Or';
  readonly _URI!: URI;
  readonly _A!: A;
  constructor(readonly left: A, readonly right: A) {}
  map: ExprMap<A> = f => new Or(f(this.left), f(this.right));
}
