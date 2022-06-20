import { box, Box } from 'src/box';
import { pos, size } from 'src/geometry';
import { Pair } from 'util/tuple';
import { assert, suite, test } from 'vitest';

const testSize = (name: string, iut: Box, expect: Pair<number>) =>
  test(name, () => assert.deepEqual(box.size.get(iut), size.tupled(expect)));

const [b1x1, b2x1, b1x2, b2x2] = [
  box.of('A'),
  box.of('AB'),
  box.of('A\nB'),
  box.of('A\nBC'),
];

suite('box size', () => {
  suite('block size', () => {
    suite('measure grid', () => {
      testSize('b1x1', b1x1, [1, 1]);
      testSize('b2x1', b2x1, [2, 1]);
      testSize('b1x2', b1x2, [1, 2]);
      testSize('b2x2', b2x2, [2, 2]);
    });

    suite('mod size', () => {
      testSize('b1x1 + 3x0', box.addWidth(3)(b1x1), [4, 1]);
      testSize('b2x1 + 3x1', box.addSize(size(3, 1))(b2x1), [5, 2]);
    });

    suite('wide characters', () => {
      testSize('emoji', box.fromRow('🙂'), [2, 1]);
      testSize('narrow+wide', box.fromRow('A🙂Z'), [4, 1]);
    });
  });
  suite('panel size', () => {
    suite('one child in tight box', () => {
      testSize('b1x1', box.branch([b1x1]), [1, 1]);
      testSize('b2x1', box.branch([b2x1]), [2, 1]);
      testSize('b1x2', box.branch([b1x2]), [1, 2]);
      testSize('b2x2', box.branch([b2x2]), [2, 2]);

      suite('position has no effect', () => {
        testSize('b1x1', box.branch([box.left.set(1)(b1x1)]), [1, 1]);
        testSize('b2x1', box.branch([box.top.set(3)(b2x1)]), [2, 1]);
      });

      suite('two nodes', () => {
        testSize(
          'b1x1@▲0◀0 ⊕ b1x1@▲1◀0',
          box.branch([b1x1, box.top.set(1)(b1x1)]),
          [1, 2],
        );

        testSize(
          'b1x1@▲0◀0 ⊕ b2x2@▲1◀1',
          box.branch([b1x1, box.pos.set(pos(1, 1))(b2x2)]),
          [3, 3],
        );
      });
    });
  });
});
