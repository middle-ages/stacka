import { function as FN, option as OP } from 'fp-ts';
import { applyEvery, fork } from 'fp-ts-std/Function';
import { mapBoth, toSnd } from 'fp-ts-std/Tuple';
import { Box, MaybeBox } from 'src/box';
import {
  borderDir,
  BorderDir,
  Corner,
  corner,
  Cornered,
  dir,
  orientations,
} from 'src/geometry';
import { BinaryC, Endo, Unary } from 'util/function';
import { copyFromWith, ModLens, modLens } from 'util/lens';
import { typedFromEntries } from 'util/object';
import { Pair, pairFlow, Tuple4 } from 'util/tuple';
import { Border } from './types';

export const partAt: Unary<BorderDir, ModLens<Border, MaybeBox>> = d =>
  modLens({
    get: b => b[d],
    set: part => b => ({ ...b, [d]: part }),
  });

export const parts: Record<BorderDir, ModLens<Border, MaybeBox>> = FN.pipe(
  toSnd(partAt),
  borderDir.map,
  typedFromEntries,
);

export const setMaybePart: BinaryC<BorderDir, MaybeBox, Endo<Border>> = d =>
  partAt(d).set;

export const setPart: BinaryC<BorderDir, Box, Endo<Border>> = d =>
  FN.flow(OP.some, setMaybePart(d));

export const [setMaybeVParts, setMaybeHParts]: Pair<
  Unary<MaybeBox, Endo<Border>>
> = FN.pipe(
  orientations,
  mapBoth(dirs =>
    FN.flow(
      fork(FN.pipe(dirs, dir.orientDirs, mapBoth(setMaybePart))),
      pairFlow,
    ),
  ),
);

export const setCorners: Unary<Tuple4<Box>, Endo<Border>> = cornerBoxes => {
  const build: Unary<Corner, Endo<Border>> = c => {
    const boxes: Cornered<Box> = FN.pipe(
      cornerBoxes,
      corner.zip,
      typedFromEntries,
    );
    return FN.pipe(boxes[c], setPart(c));
  };

  return FN.pipe(build, corner.map, applyEvery);
};

export const [setHParts, setVParts]: Pair<Unary<Box, Endo<Border>>> = [
  FN.flow(OP.some, setMaybeHParts),
  FN.flow(OP.some, setMaybeVParts),
];

export const copyPart: BinaryC<BorderDir, Pair<Border>, Border> = FN.flow(
  partAt,
  copyFromWith<MaybeBox>(FN.identity),
);
