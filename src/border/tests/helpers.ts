import { function as FN } from 'fp-ts';
import { Border, border } from 'src/border';
import { box } from 'src/box';
import { assert, test } from 'vitest';

export const testBorderWith =
  (content: string) => (name: string, actual: Border, expect: string[]) =>
    test(name, () =>
      assert.deepEqual(
        FN.pipe(content, box.fromRow, border(actual), box.asStringsWith('.')),
        expect,
      ),
    );

export const testBorder = testBorderWith('X');
