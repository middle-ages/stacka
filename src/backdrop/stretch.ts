import { array as AR, function as FN, nonEmptyArray as NE } from 'fp-ts';
import { transpose } from 'fp-ts-std/Array';
import { fork } from 'fp-ts-std/Function';
import { Size } from 'src/geometry';
import { grid, Grid, Row } from 'src/grid';
import { addAround, head, init, last, tail } from 'util/array';
import { Endo, Unary } from 'util/function';
import { floorMod } from 'util/number';
import { Pair } from 'util/tuple';

const expand: Unary<Pair<number>, Endo<Row>> =
  ([parentLen, childLen]) =>
  row => {
    const [ratio, rem] = floorMod([parentLen, childLen]);
    return FN.pipe(
      row,
      AR.chainWithIndex((idx, ms) =>
        AR.replicate(ratio + (idx < rem ? 1 : 0), ms),
      ),
    );
  };

export const contract: Unary<Pair<number>, Endo<Row>> =
  ([parentLen, childLen]) =>
  row => {
    const [begin, end] = FN.pipe(row, fork([head, last]));
    if (parentLen === 1) return [begin];
    else if (childLen === 2) return [begin, end];

    const mapIndex: Endo<number> = i => Math.ceil((childLen / parentLen) * i);

    return FN.pipe(
      FN.pipe(NE.range(0, parentLen - 1), AR.map(mapIndex)),
      AR.map(i => row[i]),
      init,
      tail,
      addAround([[begin], [end]]),
    );
  };

const stretchAxis: Unary<Pair<number>, Endo<Row>> = ([parentLen, childLen]) =>
  parentLen === childLen
    ? FN.identity
    : FN.pipe([parentLen, childLen], childLen > parentLen ? contract : expand);

export const stretch: Unary<Size, Endo<Grid>> = surfaceSize => image => {
  const { width: surfaceWidth, height: surfaceHeight } = surfaceSize,
    { width: seedWidth, height: seedHeight } = grid.measureAligned(image);

  return FN.pipe(
    image,
    AR.map(stretchAxis([surfaceWidth, seedWidth])),
    transpose,
    AR.map(stretchAxis([surfaceHeight, seedHeight])),
    transpose,
  );
};
