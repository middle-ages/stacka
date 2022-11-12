import { suite } from 'vitest';
import * as PA from '../parse';
import * as IUT from '../stack';
import { testPaint } from './helpers';

suite('grid stack', () => {
  const narrowRow = '..xx'.replaceAll('.', ' ');
  testPaint(
    'narrow above wide',
    IUT.stack('over')([PA.parseRow('🙂😢'), PA.parseRow(narrowRow)]),
    ['🙂xx'],
  );

  testPaint(
    'narrow above wide 2 rows',
    IUT.stack('over')([
      PA.parseRows('left', ['🙂😢', '🙂😢']),
      PA.parseRows('left', [narrowRow, narrowRow]),
    ]),
    ['🙂xx', '🙂xx'],
  );
});
