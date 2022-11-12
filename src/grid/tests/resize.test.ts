import { assert, suite, test } from 'vitest';
import * as IUT from '../resize';
import * as TY from '../types';
import { align } from 'src/align';

suite('grid resize', () => {
  test('-w +h', () =>
    assert.deepEqual(
      TY.size(
        IUT.resize(align.middleCenter)({ width: 4, height: 2 })(
          TY.sized({ width: 3, height: 5 }),
        ),
      ),
      { width: 4, height: 2 },
    ));
});
