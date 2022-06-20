import { function as FN, tuple as TU } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import { zip } from 'util/array';
import { BinaryC } from 'util/function';
import { mapValues, typedFromEntries } from 'util/object';
import { Tuple3 } from 'util/tuple';
import { Dir } from '../dir';
import { dirToBorderDirs } from './dir';
import { getDirParts } from './part';
import { Border, emptyPart, Part } from './types';

/** The border at a specific direction */
export type EdgeBorder = Tuple3<Part>;

const zeroEdgeBorder: EdgeBorder = [emptyPart, emptyPart, emptyPart];

export const setBorderEdge =
  (b: Border): BinaryC<Dir, EdgeBorder, Border> =>
  dir =>
  edge => {
    const [parts, style] = FN.pipe(
      dir,
      dirToBorderDirs,
      FN.pipe(edge, zip),
      typedFromEntries,
      fork([mapValues(TU.fst), mapValues(TU.snd)]),
    );
    return { parts: { ...b.parts, ...parts }, style: { ...b.style, ...style } };
  };

export const unsetBorderEdge: BinaryC<Border, Dir, Border> = b => dir =>
  FN.pipe(zeroEdgeBorder, FN.pipe(dir, setBorderEdge(b)));

/** Chop off an an edge at given direction. */
export const chopBorderEdge: BinaryC<Border, Dir, [Border, EdgeBorder]> = (
  b: Border,
) => fork([unsetBorderEdge(b), getDirParts(b)]);
