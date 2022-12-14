import { function as FN } from 'fp-ts';
import { box } from 'src/box';
import * as color from 'src/color';
import { test, assert, suite } from 'vitest';

const blend = color.defaultBlendMode;

suite('box instances', () => {
  suite('show', () => {
    test('leaf', () =>
      assert.equal(
        box.show(box({ row: 'foo' })),
        `leaf(▲0:◀0 ↔3:↕1 ⭹ ${blend} 3ˣ1 100% non-empty)`,
      ));
    test('branch', () =>
      assert.equal(
        FN.pipe(
          'foo',
          box.fromRow,
          FN.pipe('bar', box.fromRow, box.below),
          box.show,
        ),
        `tree(▲0:◀0 ↔3:↕2 ⭹ ${blend} 0ˣ0 0% non-empty)` +
          '([' +
          `leaf(▲0:◀0 ↔3:↕1 ⭹ ${blend} 3ˣ1 100% non-empty)` +
          ', ' +
          `leaf(▲1:◀0 ↔3:↕1 ⭹ ${blend} 3ˣ1 100% non-empty)` +
          '])',
      ));
  });
});
