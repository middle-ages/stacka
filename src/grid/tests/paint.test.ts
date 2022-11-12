import { HAlign } from 'src/align';
import { suite, test } from 'vitest';
import { paint } from '../paint';
import { parseRows } from '../parse';
import { gridEq } from './helpers';
import ansis from 'ansis';

suite('grid paint', () => {
  const testPaint = (name: string, align: HAlign, rows: string[]) => {
    const expect = parseRows(align, rows),
      actual = parseRows(align, paint(expect));

    test(name, () => gridEq(actual, expect));
  };

  testPaint('empty', 'left', []);

  testPaint('narrow plain 1x1', 'left', ['a']);

  testPaint('narrow plain 3x2', 'center', ['abc', '123']);

  testPaint('red narrow', 'right', [ansis.red('red')]);

  testPaint('bold red narrow', 'right', [ansis.red.bold('x')]);
});
