import { suite } from 'vitest';
import * as PA from '../parse';
import * as IUT from '../stack';
import { testPaint } from './helpers';

suite('grid stack', () => {
  const narrowRow = '..xx'.replaceAll('.', ' ');
  testPaint(
    'narrow above wide',
    IUT.stack('over')([PA.parseRow('ðð¢'), PA.parseRow(narrowRow)]),
    ['ðxx'],
  );

  testPaint(
    'narrow above wide 2 rows',
    IUT.stack('over')([
      PA.parseRows('left', ['ðð¢', 'ðð¢']),
      PA.parseRows('left', [narrowRow, narrowRow]),
    ]),
    ['ðxx', 'ðxx'],
  );
});
