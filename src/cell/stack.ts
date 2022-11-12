import { BlendMode } from 'src/color';
import { glyph } from 'src/glyph';
import { BinOpT, Unary } from 'util/function';
import * as ST from 'src/style';
import * as PA from './packed';
import { PackedCell } from './packed';
import { decode, encode } from './rune';
import { Cell } from './types';

const combine = glyph.combine;

/**
 * Stack two narrow character cells on top of each other by stacking the cell
 * styles and glyphs.
 *
 * 1. Styles: colors are blended and text decorations merged
 * 2. Glyphs: Glyph combination is attempted. When no combination glyph can be
 *    found, `above` wins over `below` except for the `under` and `combineUnder`
 *    blend modes, where the opposite takes place
 *
 * Works only for `char` or `none` cells.
 *
 */
export const stackPackedNarrow: Unary<BlendMode, BinOpT<PackedCell>> =
  mode =>
  ([lower, upper]) => {
    const [lowerStyle, lowerRune, lowerType] = lower,
      [upperStyle, upperRune, upperType] = upper;

    if (upperType === 0) return lower;
    else if (lowerType === 0) return upper;
    else if (mode === 'under') return lower;
    else if (mode === 'over') return upper;

    const [lowerChar, upperChar] = [decode(lowerRune), decode(upperRune)],
      combined = encode(combine([lowerChar, upperChar]));

    return mode === 'combineUnder'
      ? [lowerStyle, combined, 1]
      : mode === 'combineOver'
      ? [upperStyle, combined, 1]
      : [ST.blend(mode)([lowerStyle, upperStyle]), combined, 1];
  };

export const stackNarrow: Unary<BlendMode, BinOpT<Cell>> =
  mode =>
  ([lower, upper]) =>
    PA.unpackCell(
      stackPackedNarrow(mode)([PA.packCell(lower), PA.packCell(upper)]),
    );

export const stackPackedWide: Unary<BlendMode, BinOpT<PackedCell>> =
  mode =>
  ([lower, upper]) =>
    mode === 'under' || mode === 'combineUnder' ? lower : upper;

/**
 * Stack two packed chunks of cells that are of equal width but possibly
 * different cell count, which will happen in case one includes any wide
 * characters. The only case the alignment will be perfect in presence of
 * wide characters is when they are aligned between the rows.
 *
 */
export const stackPacked: Unary<BlendMode, BinOpT<PackedCell[]>> =
  mode =>
  ([lowerChunk, upperChunk]) => {
    const [lowerLength, upperLength] = [lowerChunk.length, upperChunk.length],
      [[lower], [upper]] = [lowerChunk, upperChunk];

    return [
      lowerLength === 1 && upperLength == 1
        ? stackPackedNarrow(mode)([lower, upper])
        : stackPackedWide(mode)([lower, upper]),
    ];
  };
