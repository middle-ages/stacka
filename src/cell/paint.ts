import ansis, { Ansis } from 'ansis';
import { predicate as PRE } from 'fp-ts';
import { Endo, Unary } from 'util/function';
import * as ST from '../style';
import { Style } from '../style';
import { PackedCell } from './packed';
import { decode } from './rune';

export type PrevStyle = [Style, Ansis];

export const emptyPrev: PrevStyle = [ST.empty, ansis];

export const isEmptyPrev: PRE.Predicate<PrevStyle> = ([prevStyle]) =>
  ST.isEmpty(prevStyle);

export const closePrev: Unary<PrevStyle, Endo<string>> =
  ([, prevAnsis]) =>
  s =>
    prevAnsis.close + s;

/**
 * Paint cell to string.
 *
 * `PrevStyle` is expected as a parameter and returned in the result.
 *
 * We use it for optimization: we want to avoid repainting the current ANSI
 * style. Using the previous style we can paint the style only when it changes.
 *
 * Because we _do not_ close the ANSI styles after painting each cell, you
 * should append a call to `closePrev(prevStyle)(cellString)` at the end of a
 * row.
 *
 * @param fillWith _none_ cells will be replaced with this string
 * @returns
 * @param cell `PackedCell` to paint
 * @param prev previous style and formatter
 *
 */
export const paintWith =
  (fillWith: string) =>
  ([style, rune, type]: PackedCell, prev: PrevStyle): [string, PrevStyle] => {
    const prevIsEmpty = isEmptyPrev(prev);
    if (type === 0)
      return [prevIsEmpty ? fillWith : closePrev(prev)(fillWith), emptyPrev];

    if (type === 3) return ['', prev];

    const char = rune === 0 ? fillWith : decode(rune);

    if (ST.isEmpty(style))
      return [prevIsEmpty ? char : closePrev(prev)(char), emptyPrev];

    if (ST.eq.equals(style, prev[0])) return [char, prev];

    const newAnsis = ST.addToAnsis(style)(ansis);

    const close = prevIsEmpty ? '' : closePrev(prev)('');

    return [close + newAnsis.open + char, [style, newAnsis]];
  };

export const paint = paintWith(' ');
