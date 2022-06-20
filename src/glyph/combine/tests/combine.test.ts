import { Effect } from 'util/function';
import { assert, suite, test } from 'vitest';
import { combine } from '../combine';

type TestData = `${string} ${string} ${string}`;

const check = (testData: TestData) => {
  const [fst, snd, expect] = testData.split(/\s+/);
  const actual = combine([fst, snd]);
  test(testData, () => assert.equal(actual, expect));
};

const checks: Effect<TestData[]> = tests => tests.forEach(check);

suite('glyph combine', () => {
  suite('thin', () =>
    checks([
      '┼ ┴ ┼', //
      '└ ┌ ├',
    ]),
  );

  suite('thick', () => {
    checks(['┛ ┗ ┻', '┓ ┏ ┳', '┓ ┛ ┫']);
  });

  suite('thick-thin', () =>
    checks([
      '┙ ┖ ┹', //

      '┙ ┸ ┹',

      '┙ ┸ ┹',

      '┙ ┚ ┛',

      '┙ ┍ ┿',

      '┙ ┍ ┿',

      '┙ └ ┵',

      '┒ ┚ ┨',

      '┯ ━ ┯',

      '╃ ╅ ╉',

      '│ ━ ┿',

      '┳ │ ╈',

      '┏ └ ┢',
    ]),
  );

  suite('halfSolid', () =>
    checks([
      '▖ ▘ ▌', //

      '▖ ▝ ▞',

      '▗ ▘ ▚',

      '█ █ █',

      '▌ ▝ ▛',
    ]),
  );
  suite('double', () =>
    checks([
      '╗ ╔ ╦', //
      '╗ ║ ╣',
      '═ ║ ╬',
      '═ ─ ━',
    ]),
  );

  suite('double-single', () => checks(['╜ ╙ ╨', '╖ ║ ╢']));
});
