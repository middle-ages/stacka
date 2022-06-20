import { number as NU } from 'fp-ts';
import {
  measureSpacing,
  Padding,
  paintSpacing,
  showPadding,
  spacingFromTuple,
  spacingMonoid,
} from 'src/spacing';
import { assert, suite, test } from 'vitest';

suite('spacing', () => {
  const padding: Padding = spacingFromTuple([1, 2, 3, 4]),
    size = measureSpacing(padding),
    double = spacingMonoid(NU.MonoidSum).concat(padding, padding),
    show = showPadding.show,
    rendered = paintSpacing(spacingFromTuple([0, 0, 2, 1]))(['x  ', 'zzz']);

  test('show', () => assert.equal(show(padding), 'padding=↑:1 →:2 ↓:3 ←:4'));
  test('size', () => assert.deepEqual(size, { width: 6, height: 4 }));
  test('monoid', () =>
    assert.deepEqual(show(double), 'padding=↑:2 →:4 ↓:6 ←:8'));

  test('renderSpacing', () =>
    assert.deepEqual(rendered, [' x  ', ' zzz', '    ', '    ']));
});
