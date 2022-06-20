import { function as FN } from 'fp-ts';
import { Box, box } from 'src/box';
import { assert, suite, test } from 'vitest';
import { testPaint } from './helpers';

suite('box cat', () => {
  test('basic', () => {
    const triad = [box.of('A'), box.of('BB'), box.of('C')];

    const parent = box.catBelow(triad);

    const actual = FN.pipe(parent, box.asStringsWith('.'));

    assert.deepEqual(actual, ['A.', 'BB', 'C.']);
  });

  const [foo, bar] = [box.of('f\no\no'), box.of('bar')],
    pair: Box[] = [foo, bar],
    triad: Box[] = [...pair, foo],
    quartet: Box[] = [...pair, ...pair];

  suite('“cat${ DIR }”: catBelow, catRightOf', () => {
    /**
     * ```txt
     * ╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╮
     * ┊ ┌─0────┐    ┌─012──┐ ┊
     * ┊ │ ┊    │    │ ┊    │ ┊
     * ┊ 0┈f░░░┈┤    0┈bar░┈┤ ┊
     * ┊ 1 o░░░ │    │ ░░░░ │ ┊
     * ┊ 2 o░░░ │    │ ░░░░ │ ┊
     * ┊ │ ░░░░ │    │ ░░░░ │ ┊
     * ┊ │ ┊    │    │ ┊    │ ┊
     * ┊ └─┴────┘    └─┴────┘ ┊
     * ┊                      ┊
     * ┊ foo  1x3    bar  3x1 ┊
     * ╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯
     * ```
     */
    suite('→', () => {
      testPaint('pair', box.catRightOf(pair), [
        'f...', //
        'o...',
        'obar',
      ]);

      testPaint('triad', box.catRightOf(triad), [
        'f...f', //
        'o...o',
        'obaro',
      ]);

      testPaint('quartet', box.catRightOf(quartet), [
        'f...f...', //
        'o...o...',
        'obarobar',
      ]);
    });

    suite('↓', () => {
      testPaint('pair', box.catBelow(pair), [
        'f..', //
        'o..',
        'o..',
        'bar',
      ]);

      testPaint('triad', box.catBelow(triad), [
        'f..', //
        'o..',
        'o..',
        'bar',
        'f..',
        'o..',
        'o..',
      ]);

      testPaint('quartet', box.catBelow(quartet), [
        'f..', //
        'o..',
        'o..',
        'bar',
        'f..',
        'o..',
        'o..',
        'bar',
      ]);
    });
  });

  suite('“cat${ DIR }Gap”: catRightOfGap, catBelowGap', () => {
    suite('rightOfGap', () => {
      testPaint('pair', box.catRightOfGap(1)(pair), [
        'f....', //
        'o....',
        'o.bar',
      ]);

      testPaint('triad', box.catRightOfGap(1)(triad), [
        'f.....f', //
        'o.....o',
        'o.bar.o',
      ]);

      testPaint('quartet', box.catRightOfGap(1)(quartet), [
        'f.....f....', //
        'o.....o....',
        'o.bar.o.bar',
      ]);
    });

    suite('below', () => {
      testPaint('pair', box.catBelowGap(1)(pair), [
        'f..', //
        'o..',
        'o..',
        '...',
        'bar',
      ]);

      testPaint('triad', box.catBelowGap(1)(triad), [
        'f..', //
        'o..',
        'o..',
        '...',
        'bar',
        '...',
        'f..',
        'o..',
        'o..',
      ]);

      testPaint('quartet', box.catBelowGap(1)(quartet), [
        'f..', //
        'o..',
        'o..',
        '...',
        'bar',
        '...',
        'f..',
        'o..',
        'o..',
        '...',
        'bar',
      ]);
    });
  });
});
