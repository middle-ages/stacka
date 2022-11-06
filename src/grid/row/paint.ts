import assert from 'assert';
import { function as FN } from 'fp-ts';
import stringWidth from 'string-width';
import { BinaryC } from 'util/function';
import { cell, Cell } from '../cell/cell';
import { style as SY } from '../style/style';
import { Row } from './types';

/**
 * Paint a character, possibly spread over several cells, into a string.
 * The 1st argument, which must be a narrow character, will be used as a
 * substitute for empty cells
 */
export const paintCharWith: BinaryC<string, Cell[], string> =
  sub =>
  ([headCell]) => {
    assert(!cell.isCont(headCell), 'cannot paint “cont” cell');
    assert(
      stringWidth(sub) === 1,
      `can only fold empty into single width char: “${sub}”`,
    );
    if (cell.isNone(headCell)) return sub;

    return FN.pipe(headCell.char, SY.paint(headCell.style));
  };

/** Paint a row into a string with narrow char in 1st argument as filler */
export const asStringWith: BinaryC<string, Row, string> = sub => row => {
  const paintChar = paintCharWith(sub);
  return cell.chunkChars(row).map(paintChar).join('');
};

export const asString = asStringWith(' ');
