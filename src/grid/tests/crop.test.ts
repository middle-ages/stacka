import { assert, suite, test } from 'vitest';
import * as IUT from '../crop';
import * as TY from '../types';

suite('grid shrink', () => {
  test('1 top 1 left', () =>
    assert.deepEqual(
      TY.size(
        IUT.crop({ top: 1, right: 0, bottom: 0, left: 1 })(
          TY.sized({ width: 3, height: 5 }),
        ),
      ),
      { width: 2, height: 4 },
    ));
});
