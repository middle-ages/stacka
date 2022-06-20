import { array as AR, function as FN } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { bitmap } from 'src/bitmap';
import { box } from 'src/box';
import { typedValues, picksT } from 'util/object';
import { suite } from 'vitest';
import { testPaint, testPaints } from './helpers';
import { orientations } from 'src/geometry';

suite('box paint', () => {
  suite('paint order', () => {
    const leaf1x1 = box.fromRow('A'),
      leaf2x1 = box.fromRow('BC'),
      parent1x1_over = FN.pipe([leaf1x1], box.branchWith({ row: 'D' })),
      parent1x1_under = FN.pipe(
        [leaf1x1],
        box.branchWith({ row: 'D', blend: 'under' }),
      ),
      parent2x1 = box.branch([leaf2x1, leaf1x1]),
      parent2x1_inv = box.branch([leaf1x1, leaf2x1]),
      parent2x1_zOrder = box.branch([box.incZOrder(leaf2x1), leaf1x1]);

    testPaints(
      ['leaf1x1', leaf1x1, ['A']],
      ['leaf2x1', leaf2x1, ['BC']],

      ['parent1x1_over', parent1x1_over, ['A']],
      ['parent1x1_under', parent1x1_under, ['D']],

      ['parent2x1', parent2x1, ['AC']],
      ['parent2x1_inv', parent2x1_inv, ['BC']],
      ['parent2x1_zOrder', parent2x1_zOrder, ['BC']],
    );
  });

  suite('combine', () => {
    const actual = FN.pipe(
      bitmap.line,
      picksT(orientations),
      typedValues,
      mapBoth(box.fromRow),
      box.branch,
    );

    testPaint('child boxes', actual, [bitmap.cross]);
  });

  suite('size to content', () => {
    const leaf1x2 = box.fromRows(['A', 'B']),
      parent2x2 = FN.pipe(leaf1x2, AR.of, box.branchWith({ row: 'CD' }));

    testPaint('child+own content determine size', parent2x2, ['A.', 'BD']);
  });

  suite('wide characters', () => {
    const nEmos = (n: number) => AR.replicate(n, '🙂').join(''),
      nEmosBox = FN.flow(nEmos, box.fromRow);

    const wide2x1 = nEmosBox(1),
      wide8x1 = nEmosBox(4),
      parentOneChild = box.branch([wide8x1]),
      oneWideOneNarrow = FN.pipe(wide2x1, box.leftOf(box.fromRow('X'))),
      oneNarrowOneWide = FN.pipe('X', box.fromRow, box.leftOf(wide2x1)),
      parent4x1 = FN.pipe(wide2x1, box.leftOf(wide2x1)),
      complex = FN.pipe(
        [parent4x1, parentOneChild, oneNarrowOneWide],
        box.catRightOf,
      );

    testPaints(
      ['single wide', wide2x1, [nEmos(1)]],
      ['horizontal wide', wide8x1, [nEmos(4)]],
      ['one wide child', parentOneChild, [nEmos(4)]],
      ['one wide one narrow child', oneWideOneNarrow, [nEmos(1) + 'X']],
      ['one narrow one wide child', oneNarrowOneWide, ['X' + nEmos(1)]],
      ['two wide children', parent4x1, [nEmos(2)]],
      ['complex', complex, [nEmos(2) + nEmos(4) + 'X' + nEmos(1)]],
    );
  });
});
