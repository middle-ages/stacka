import { lensAt } from 'util/lens';
import { assert, suite, test } from 'vitest';

interface Baz {
  baz1N: number;
}

interface Bar {
  bar1B: boolean;
  bar2: Baz;
}

interface Foo {
  foo1S: string;
  foo2A: RegExp[];
  foo3: Bar;
}

const baz: Baz = { baz1N: 42 },
  bar: Bar = { bar1B: true, bar2: baz },
  foo: Foo = { foo1S: 'foo1S', foo2A: [/foo2A/], foo3: bar };

const baz_baz1N = lensAt<Baz>()('baz1N');
const bar_bar1B = lensAt<Bar>()('bar1B');
const foo_foo3_bar2_baz1N = lensAt<Foo>()('foo3.bar2.baz1N');

suite('lens', () => {
  suite('get', () => {
    test('baz_baz1N', () => {
      assert.equal(baz_baz1N.get(baz), 42);
    });
    test('bar_bar1B', () => {
      assert.equal(bar_bar1B.get(bar), true);
    });
    test('foo_foo3_bar2_baz1N', () => {
      assert.equal(foo_foo3_bar2_baz1N.get(foo), 42);
    });
  });
});
