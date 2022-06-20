import { border } from 'src/border';
import { suite } from 'vitest';
import { testBorder } from './helpers';

suite('border edge', () => {
  const iut = border.sets.line;

  testBorder('noHEdges', border.mask.noHEdges(iut), ['│X│']);

  testBorder('noVEdges', border.mask.noVEdges(iut), [
    '─', //
    'X',
    '─',
  ]);

  testBorder('copyHEdges', border.copyHEdges([iut, border.sets.thick]), [
    '┌━┐', //
    '│X│',
    '└━┘',
  ]);

  testBorder('copyVEdges', border.copyHEdges([border.sets.double, iut]), [
    '╔─╗', //
    '║X║',
    '╚─╝',
  ]);
});
