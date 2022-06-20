import { option as OP } from 'fp-ts';
import { Cornered } from 'src/geometry';
import { assert, suite, test } from 'vitest';
import { named } from '../named';

const thin = {
  horizontal: named.line.horizontal,
  vertical: named.line.vertical,
} as const;

const assertDirs = (actual: Cornered<OP.Option<string>>, expect: string) => {
  const [topLeft, topRight, bottomLeft, bottomRight] = Array.from(expect);
  assert.deepEqual(actual, {
    topLeft: OP.some(topLeft),
    topRight: OP.some(topRight),
    bottomLeft: OP.some(bottomLeft),
    bottomRight: OP.some(bottomRight),
  });
};

suite('named bitmaps', () => {
  suite('elbowsFor', () => {
    test('basic', () => assertDirs(named.elbowsFor(thin), '┌┐└┘'));

    test('round', () => assertDirs(named.roundElbowsFor(thin), '╭╮╰╯'));

    test('hThick', () =>
      assertDirs(
        named.elbowsFor({ ...thin, horizontal: named.line.thick.horizontal }),
        '┍┑┕┙',
      ));
  });
});
