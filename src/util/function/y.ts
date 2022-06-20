import { Endo, Unary } from './types';

export type YF<A, R> = Endo<Unary<A, R>>;
export type Y = <A, R>(f: YF<A, R>) => Unary<A, R>;
export type YM<A, R> = (f: YM<A, R>) => Unary<A, R>;

export const self = <A, R>(f: YM<A, R>): Unary<A, R> => f(f);

export const Y: Y = (
  <A, R>(m: YM<A, R>) =>
  (f: YF<A, R>) =>
    m(n => f(x => self(n)(x)))
)(self);

/*


export type YF<A, R> = Endo<Unary<A, R>>;
export type YM<A, R> = (f: YM<A, R>) => Unary<A, R>;

export type YOF<A, R> = (f: YF<A, R>) => Unary<A, R>;
export type Y = <A, R>(f: YF<A, R>) => Unary<A, R>;

export const self = <A, R>(f: YM<A, R>): Unary<A, R> => f(f);

export const Y: Y = (
  <A, R>(m: YM<A, R>): YOF<A, R> =>
  f =>
    m(flow(self, f))
)(self);


export type YF<A, R> = Endo<Unary<A, R>>;
export type YM<A, R> = (f: YM<A, R>) => Unary<A, R>;

export type YOF<A, R> = (f: YF<A, R>) => Unary<A, R>;
export type Y = <A, R>(f: YF<A, R>) => Unary<A, R>;

export const self = <A, R>(f: YM<A, R>): Unary<A, R> => f(f);

export const Y: Y = (
  <A, R>(m: YM<A, R>): YOF<A, R> =>
  f =>
    m(flow(self, f))
)(self);
aa

export type F = Endo<number>;
export type G = Endo<F>;
export type Y = Unary<G, F>;
export type R = (r: R) => F;

export const G: G = f => n => n === 0 ? 1 : n * f(n - 1);

export const ZZ = (g: G) => (r: R) => g(n => r(r)(n));
 x(x)(v)))(x => g(v => x(x)(v)))


export const Z = (g: G) => ZZ(g)(ZZ(g));

console.log(Z(G)(4));
//
//const Z = g => (x => g(v =>
*/
