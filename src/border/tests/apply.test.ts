import { border } from 'src/border';
import { suite } from 'vitest';
import { testBorder, testBorderWith } from './helpers';

suite('border apply', () => {
  testBorder('basic', border.sets.line, [
    '┌─┐', //
    '│X│',
    '└─┘',
  ]);

  testBorderWith('🙂')('wide characters', border.sets.line, [
    '┌──┐', //
    '│🙂│',
    '└──┘',
  ]);
});
