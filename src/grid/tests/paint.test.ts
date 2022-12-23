import ansis from 'ansis';
import * as color from 'src/color';
import { assert, suite, test } from 'vitest';
import { paint } from '../paint';
import { parseRows } from '../parse';
import { gridEq } from './helpers';

suite('grid paint', () => {
  const testPaint = (name: string, rows: string[]) => {
    const expect = parseRows('left', rows),
      actual = parseRows('left', paint(expect));

    test(name, () => gridEq(actual, expect));
  };

  testPaint('empty', []);

  testPaint('narrow plain 1x1', ['a']);

  testPaint('wide', ['🙂']);

  testPaint('narrow plain 3x2', ['abc', '123']);

  testPaint('red narrow', [ansis.red('red')]);

  testPaint('bold red narrow', [ansis.red.bold('x')]);

  testPaint('fg+bg', [ansis.red.bgBlue('red-on-blue')]);

  test('alternating fg+bg changes', () => {
    const fgRedBgBlue = color.of(['red', 'blue']),
      fgRedBgGreen = color.of(['red', 'green']),
      fgWhiteBgGreen = color.of(['white', 'green']);

    const expect = [fgRedBgBlue('a') + fgRedBgGreen('b') + fgWhiteBgGreen('c')];

    const actual = paint(parseRows('left', expect));

    assert.deepEqual(actual, expect);
  });
});
