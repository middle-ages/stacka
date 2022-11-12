import { function as FN } from 'fp-ts';
import * as color from 'src/color';
import { assert, suite, test } from 'vitest';
import * as IUT from '../types';
import { Style } from '../types';

const boldItalic = FN.pipe(IUT.empty, IUT.setDecoList(['bold', 'italic']));

suite('style types', () => {
  suite('solid red bold', () => {
    const [fg, bg, deco]: Style = [color.normalize('red'), 0, 1];
    test('fg', () => assert.equal(color.r.get(fg), 255));
    test('bg', () => assert.equal(bg, 0));
    test('deco', () => assert.equal(deco, 1));
  });

  test('getDeco', () => assert.equal(IUT.getDeco(boldItalic), 5));

  test('hasDeco', () =>
    FN.pipe(boldItalic, IUT.hasDeco('bold'), assert.isTrue));
});
