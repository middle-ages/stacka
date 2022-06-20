import { function as FN, option as OP } from 'fp-ts';
import { bitmap } from 'src/bitmap';
import { glyph } from 'src/glyph';
import { assert, suite, test } from 'vitest';

const char = bitmap.line.bottom;

suite('glyph', () => {
  test('glyphByChar', () => {
    const iut = glyph.glyphByChar(char);

    assert.equal(
      FN.pipe(
        iut,
        OP.fold(
          () => ' ',
          g => g.char,
        ),
      ),
      char,
    );
  });

  test('related', () =>
    assert.deepEqual(glyph.related(char), ['─', '▕', '▏', '▔', ' ', '▂']));
});
