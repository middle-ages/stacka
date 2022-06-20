import { array as AR, function as FN, predicate as PRE } from 'fp-ts';
import { emptyJoin, zipU } from 'util/array';
import { Unary, BinOp, BinOpT } from 'util/function';
import { toChars } from 'util/string';
import { Pair, pairMap } from 'util/tuple';
import { Mat, Pixel, PixelRow } from './types';

const isOn: PRE.Predicate<Pixel> = pixel => pixel === '#';

const stackPixels: BinOp<Pixel> = (fst, snd) => (isOn(fst) ? fst : snd);

const stackPixelRows: BinOp<PixelRow> = (fstString, sndString) => {
  const [fst, snd] = FN.pipe([fstString, sndString], pairMap(toChars)) as Pair<
    Pixel[]
  >;

  return FN.pipe(
    fst,
    AR.zip(snd),
    AR.map(FN.tupled(stackPixels)),
    emptyJoin,
  ) as PixelRow;
};

export const stackMatrices: BinOpT<Mat> = pair =>
  FN.pipe(pair, FN.tupled(zipU), AR.map(FN.tupled(stackPixelRows))) as Mat;

export const stackToKey: Unary<Pair<Mat>, string> = FN.flow(
  stackMatrices,
  emptyJoin,
);
