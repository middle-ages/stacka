import { pipe } from 'fp-ts/lib/function';
import { HKT } from 'fp-ts/lib/HKT';
import { BinaryC, Lazy, Unary } from 'util/function';

export const URI = 'Trampoline' as const;
export type URI = typeof URI;

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Trampoline<A>;
  }
}

const tags = ['done', 'cont', 'bind'] as const;
type Tag = typeof tags[number];

interface Base<A> extends HKT<'Trampoline', A> {
  _tag: Tag;
  _A: A;
  _URI: URI;
}

export interface Done<A> extends Base<A> {
  _tag: 'done';
  result: A;
}

export interface Cont<A> extends Base<A> {
  _tag: 'cont';
  thunk: Lazy<Trampoline<A>>;
}

export interface Bind<A, B> extends Base<B> {
  _tag: 'bind';
  sub: Trampoline<A>;
  k: Unary<A, Trampoline<B>>;
}

export type Trampoline<A, B = any> = Done<A> | Cont<A> | Bind<B, A>;

const prefix =
  <A>() =>
  <T extends Tag>(_tag: T) =>
    ({ _tag, _A: {} as A, _URI: URI } as const);

export const done = <A>(result: A): Done<A> => ({
    ...prefix<A>()('done'),
    result,
  }),
  cont = <A>(thunk: Lazy<Trampoline<A>>): Cont<A> => ({
    ...prefix<A>()('cont'),
    thunk,
  }),
  bind = <A, B>(
    sub: Trampoline<A>,
    k: Unary<A, Trampoline<B>>,
  ): Bind<A, B> => ({
    ...prefix<B>()('bind'),
    sub,
    k,
  });

export const matchTrampoline =
  <T, A, B>(
    f: Unary<A, T>,
    g: Unary<Lazy<Trampoline<A>>, T>,
    h: BinaryC<Unary<B, Trampoline<A>>, Trampoline<B>, T>,
  ): Unary<Trampoline<A, B>, T> =>
  t => {
    switch (t._tag) {
      case 'done':
        return f(t.result);
      case 'cont':
        return g(t.thunk);
      case 'bind':
        return pipe(t.sub, h(t.k));
    }
  };
