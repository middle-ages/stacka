import { function as FN, tuple as TU } from 'fp-ts';
import { emptyJoin, splitN } from 'util/array';
import { BinaryC } from 'util/function';
import { Row, toChars } from 'util/string';
import { flattenSnd, Pair, pairMap, Tuple3 } from 'util/tuple';
import { RowList, RowMapper } from '../types';

const splitCenter: BinaryC<Pair<number>, Row, Pair<string>> = pair =>
  FN.flow(
    toChars,
    splitMiddle(pair),
    ([a, , c]) => [a, c] as const,
    pairMap(emptyJoin),
  );

const splitMiddle: BinaryC<Pair<number>, RowList, Tuple3<RowList>> = ([
  top,
  height,
]) => FN.flow(splitN(top), TU.mapSnd(splitN(height)), flattenSnd);

export const replaceCenter: BinaryC<Pair<number>, Pair<string>, string> =
  ([left, width]) =>
  ([row, content]) => {
    const [before, after] = FN.pipe(row, splitCenter([left, width]));
    return emptyJoin([before, content, after]);
  };

export const replaceMiddle: BinaryC<
  Pair<number>,
  [RowList, RowMapper],
  RowList
> =
  ([top, height]) =>
  ([rows, content]) => {
    const [above, replace, below] = FN.pipe(rows, splitMiddle([top, height]));
    return [...above, ...content(replace), ...below];
  };
