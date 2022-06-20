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
