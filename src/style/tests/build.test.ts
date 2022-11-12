import { AnserJsonEntry, ansiToJson } from 'anser';
import ansis from 'ansis';
import * as color from 'src/color';
import { assert, suite, test } from 'vitest';
import { fromDecoList, fromFg, fromParsed } from '../build';
import * as DE from '../deco';
import { bgLens, deco, fgLens } from '../lens';
import { Style } from '../types';
import { colorEq } from './helpers';

suite('style build', () => {
  test('fromFg', () =>
    assert.deepEqual(fromFg('red'), [color.normalize('red'), 0, 0]));

  test('fromDecoList', () =>
    assert.deepEqual(fromDecoList(['bold']), [0, 0, 1]));

  suite('fromParsed', () => {
    const sample = ansis.hex('#0000ff').bold.underline`SAMPLE`,
      expect: Style = [0xffff0000, 0, DE.listToDeco(['bold', 'underline'])];

    const ansi = ansiToJson(sample)
      .filter(a => !a.isEmpty())
      .at(0) as AnserJsonEntry;

    const actual = fromParsed(ansi);

    test('fg', () =>
      colorEq(fgLens.color.get(actual), fgLens.color.get(expect)));

    test('bg', () =>
      assert.equal(bgLens.color.get(actual), bgLens.color.get(expect)));

    test('deco', () => assert.equal(deco.get(actual), deco.get(expect)));
  });
});
