import { unstyle } from 'ansi-colors';
import { array as AR, function as FN } from 'fp-ts';
import {
  joinAnsiChars,
  splitAnsiChars,
  StyledChars,
  StylePair,
} from 'util/char';
import { BinOp, BinOpT } from 'util/function';
import { Pair, pairMap } from 'util/tuple';
import { combine, hasGlyph } from './char';
import { Char, Row } from 'util/string';

const mergeLeftRight: BinOp<Char> = (styledLeft, styledRight) => {
  const pair: Pair<string> = [styledLeft, styledRight],
    [left, right] = FN.pipe(pair, pairMap(unstyle));

  if (left === right || left === ' ') return styledRight;
  else if (right === ' ') return styledLeft;

  return styledRight.replace(right, combine([left, right]));
};

export const mergeColumns: BinOp<Char[]> = (left, right) =>
  AR.zipWith(left, right, mergeLeftRight);

const mergeTopBottom: BinOpT<StylePair> = ([styledTop, styledBottom]) => {
  const [[, top], [bottomStyle, bottom]] = [styledTop, styledBottom];
  return top === bottom || top === ' '
    ? styledBottom
    : bottom === ' '
    ? styledTop
    : !hasGlyph(top)
    ? styledBottom
    : !hasGlyph(bottom)
    ? styledTop
    : [bottomStyle, combine([top, bottom])];
};

export const mergeRows: BinOpT<Row> = pair => {
  const [top, bottom]: Pair<StyledChars> = FN.pipe(
    pair,
    pairMap(splitAnsiChars),
  );
  return FN.pipe(
    AR.zipWith(top, bottom, FN.untupled(mergeTopBottom)),
    joinAnsiChars,
  );
};
