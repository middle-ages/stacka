import { function as FN } from 'fp-ts';
import { border } from 'src/border';
import { box } from 'src/box';
import { suite } from 'vitest';
import { testBorder } from './helpers';

suite('border part', () => {
  const iut = border.sets.line;

  testBorder('noHlines', border.mask.noHLines(iut), [
    '┌ ┐', //
    '│X│',
    '└ ┘',
  ]);

  testBorder('noVlines', border.mask.noVLines(iut), [
    '┌─┐', //
    ' X ',
    '└─┘',
  ]);

  testBorder(
    'setHParts',
    FN.pipe(iut, FN.pipe('A', box.fromRow, border.setHParts)),
    [
      '┌A┐', //
      '│X│',
      '└A┘',
    ],
  );

  testBorder('noCorners', border.mask.noCorners(iut), [
    ' ─ ', //
    '│X│',
    ' ─ ',
  ]);

  testBorder('noLines', border.mask.noLines(iut), [
    '┌ ┐', //
    ' X ',
    '└ ┘',
  ]);
});
