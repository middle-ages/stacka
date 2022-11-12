import ansis from 'ansis';
import { function as FN } from 'fp-ts';
import { align } from 'src/align';
import * as CE from 'src/cell';
import { assert, suite, test } from 'vitest';
import * as IUT from '../ops';
import * as PA from '../paint';
import { resize } from '../resize';
import * as TY from '../types';
import { narrowRed1x1, narrowRedCell } from './helpers';

const narrowRed3x3 = resize(align.middleCenter)({ width: 3, height: 3 })(
  narrowRed1x1,
);

const whiteBg = ansis.bgRgb(0xff, 0xff, 0xff);

const whiteBgRedFg = ansis.rgb(0xff, 0, 0).bgRgb(0xff, 0xff, 0xff);

const redFg = ansis.rgb(0xff, 0, 0);

suite('grid ops', () => {
  test('clearFg', () => {
    const actual = IUT.clearFg(narrowRed1x1),
      expect = FN.pipe('x', CE.plainChar, TY.oneCell);

    assert.deepEqual(actual, expect);
  });

  test('get none', () =>
    assert.deepEqual(IUT.get([0, 2])(narrowRed3x3), CE.none));

  test('get char', () =>
    assert.deepEqual(IUT.get([1, 1])(narrowRed3x3), narrowRedCell));

  test('setBg', () =>
    assert.deepEqual(
      FN.pipe(narrowRed3x3, IUT.setBg(0xff_ff_ff_ff), PA.paint),
      ['   ', ' ' + whiteBgRedFg('x') + ' ', '   '],
    ));

  test('addBg', () =>
    assert.deepEqual(
      FN.pipe(narrowRed3x3, IUT.addBg(0xff_ff_ff_ff), PA.paint),
      [
        whiteBg('   '),
        whiteBg(' ') + redFg('x') + whiteBg(' '),
        whiteBg('   '),
      ],
    ));

  test('colorBg', () => {
    const actual = FN.pipe(narrowRed3x3, IUT.colorBg(0xff_ff_ff_ff), PA.paint);

    const expect = [
      whiteBg('   '),
      whiteBg(' ') + whiteBgRedFg('x') + whiteBg(' '),
      whiteBg('   '),
    ];

    assert.deepEqual(actual, expect);
  });
});
