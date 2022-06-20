import { combine } from 'src/border';
import { assert, suite, test } from 'vitest';
import { Effect } from 'util/function';

type TestData = `${string} ${string} ${string}`;

const check = (testData: TestData) => {
  const [fst, snd, expect] = testData.split(/\s+/);
  test(testData, () => assert.equal(combine([fst, snd]), expect));
};

const checks: Effect<TestData[]> = tests => tests.forEach(check);

suite('combine', () => {
  suite('thin', () =>
    checks([
      '┴ │ ┼', //
      '└ ┌ ├',
    ]),
  );
  suite('thin/thick', () =>
    checks([
      '┒ ┚ ┨', //
      '╤ ─ ┯', //
      '╃ ╅ ╉',
    ]),
  );
  suite('filled', () =>
    checks([
      '▖ ▘ ▍', //
      '▖ ▝ ▞', //
      '▗ ▘ ▚', //
      '▗ ▝ ▐',
    ]),
  );
});
