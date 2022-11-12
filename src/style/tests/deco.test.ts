import ansis from 'ansis';
import { function as FN } from 'fp-ts';
import * as laws from 'fp-ts-laws';
import { assert, suite, test } from 'vitest';
import {
  add,
  addToAnsis,
  addListToAnsis,
  eq,
  monoid,
  hasDeco,
  show,
  Deco,
} from '../deco';
import { decoArb } from './helpers';

const boldDeco: Deco = 1,
  boldItalicDeco: Deco = 5;

suite('style deco', () => {
  suite('hasDeco', () => {
    test('⊤', () => assert.isTrue(hasDeco('bold')(boldDeco)));

    suite('⊥', () => {
      test('italic', () => assert.isFalse(hasDeco('italic')(boldDeco)));
      test('underline', () => assert.isFalse(hasDeco('underline')(boldDeco)));
    });
  });

  suite('add deco', () => {
    test('bold+italic=bold italic', () =>
      assert.deepEqual(add('italic')(boldDeco), boldItalicDeco));
    test('cannot add twice', () =>
      assert.deepEqual(add('bold')(boldDeco), boldDeco));
  });

  suite('apply deco', () => {
    test('no deco=identity', () =>
      assert.equal(addToAnsis(0)(ansis)('foo'), 'foo'));

    test('bold', () =>
      assert.equal(
        FN.pipe('foo', FN.pipe(ansis, addListToAnsis(['bold']))),
        ansis.bold`foo`,
      ));

    test('all', () =>
      assert.equal(
        FN.pipe(
          'foo',
          FN.pipe(
            0,
            add('bold'),
            add('inverse'),
            add('italic'),
            add('strikethrough'),
            add('underline'),
            addToAnsis,
          )(ansis),
        ),
        ansis.bold.inverse.italic.strikethrough.underline`foo`,
      ));
  });

  suite('instances', () => {
    suite('show', () => {
      test('0', () => assert.equal(show.show(0), 'deco(∅)'));

      test('bold+italic', () =>
        assert.equal(show.show(boldItalicDeco), 'deco(bold,italic)'));
    });

    suite('laws', () => test('monoid', () => laws.monoid(monoid, eq, decoArb)));
  });
});
