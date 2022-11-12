import {
  array as AR,
  function as FN,
  option as OP,
  predicate as PRE,
  tuple as TU,
} from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import { dup, mapBoth, toSnd, withSnd } from 'fp-ts-std/Tuple';
import { box, Box } from 'src/box';
import * as GE from 'src/geometry';
import {
  borderDir,
  dir,
  Dir,
  Directed,
  HDir,
  Orientation,
  VDir,
} from 'src/geometry';
import { BinaryC, BinOpT, Endo, Unary } from 'util/function';
import { copyFromLensWith, ModLens, modLens } from 'util/lens';
import { max } from 'util/number';
import { typedFromEntries } from 'util/object';
import { Pair, pairFlow } from 'util/tuple';
import { partAt } from './part';
import { Border, BorderEdge, EdgeParts } from './types';

export const emptyParts: EdgeParts = [OP.none, OP.none, OP.none];

export const edgeAt: Unary<Dir, ModLens<Border, BorderEdge>> = dir =>
  modLens({
    get: br => {
      const [headCornerDir, , tailCornerDir] = borderDir.snugBorderDirs(dir);

      const parts = FN.pipe(
        [headCornerDir, dir, tailCornerDir],
        AR.map(d => partAt(d).get(br)),
      ) as EdgeParts;

      return { dir, parts };
    },
    set:
      ({ dir, parts: [headPart, dirPart, tailPart] }) =>
      br => {
        const [headCornerDir, , tailCornerDir] = borderDir.snugBorderDirs(dir);
        return FN.pipe(
          br,
          partAt(headCornerDir).set(headPart),
          partAt(dir).set(dirPart),
          partAt(tailCornerDir).set(tailPart),
        );
      },
  });

/** Get only the parts where there is an actual box for an edge */
export const compactEdge: BinaryC<Dir, Border, Box[]> = dir => br =>
  AR.compact(edgeAt(dir).get(br).parts);

export const edges: Directed<ModLens<Border, BorderEdge>> = FN.pipe(
  edgeAt,
  toSnd,
  GE.dir.map,
  typedFromEntries,
);

/**
 * Are all three edge parts for a direction empty? Note empty means _nothing_
 * not the space character. Empty edges have their sizes set at zero while the
 * space character is significantly larger on both orientations.
 */
export const isEmptyEdge: Unary<Dir, PRE.Predicate<Border>> = dir => br =>
  FN.pipe(br, compactEdge(dir), AR.isEmpty);

const edgeAxisSize =
  (f: Unary<Box, number>): BinaryC<Dir, Border, number> =>
  dir =>
  br =>
    FN.pipe(br, isEmptyEdge(dir))
      ? 0
      : FN.pipe(br, compactEdge(dir), AR.map(f), max);

const [hEdgeWidth, vEdgeHeight]: [
  BinaryC<HDir, Border, number>,
  BinaryC<VDir, Border, number>,
] = FN.pipe([box.imageWidth, box.imageHeight], mapBoth(edgeAxisSize));

export const [[leftWidth, rightWidth], [topHeight, bottomHeight]]: Pair<
  Pair<Unary<Border, number>>
> = [dir.mapH(hEdgeWidth), dir.mapV(vEdgeHeight)];

export const edgeSizes: Unary<Border, Directed<number>> = br => {
  const [left, right, top, bottom] = FN.pipe(
    br,
    fork([leftWidth, rightWidth, topHeight, bottomHeight]),
  );
  return { top, right, bottom, left };
};

export const unsetEdge: Unary<Dir, Endo<Border>> = dir =>
  FN.pipe({ dir, parts: emptyParts }, edgeAt(dir).set);

export const unsetOrientEdges: Unary<Orientation, Endo<Border>> = FN.flow(
  GE.dir.orientDirs,
  mapBoth(unsetEdge),
  pairFlow,
);

export const setOrientEdges: BinaryC<Orientation, EdgeParts, Endo<Border>> =
  orient => parts =>
    FN.pipe(
      orient,
      GE.dir.orientDirs,
      mapBoth<Dir, Endo<Border>>(dir =>
        FN.pipe({ dir, parts }, edgeAt(dir).set),
      ),
      pairFlow,
    );

export const copyEdge: Unary<Dir, BinOpT<Border>> = FN.flow(
  edgeAt,
  dup,
  copyFromLensWith<BorderEdge>(FN.identity),
);

const copyEdgePair: Unary<Pair<Dir>, BinOpT<Border>> =
  ([fst, snd]) =>
  borderPair =>
    FN.pipe(
      borderPair,
      TU.fst,
      FN.pipe(borderPair, copyEdge(fst), withSnd),
      copyEdge(snd),
    );

export const [copyHEdges, copyVEdges]: Pair<BinOpT<Border>> = FN.pipe(
  [...GE.orientations],
  mapBoth(FN.flow(GE.dir.orientDirs, copyEdgePair)),
);
